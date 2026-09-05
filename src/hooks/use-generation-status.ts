"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchGeneration } from "@/features/generations/actions";
import { isGenerationActive } from "@/lib/generation";
import { createClient } from "@/lib/supabase/client";
import type { Generation, GenerationStatus } from "@/types/api";

function isGenerationStatus(value: unknown): value is GenerationStatus {
  return (
    value === "pending" ||
    value === "processing" ||
    value === "completed" ||
    value === "failed"
  );
}

function applyRealtimePatch(
  current: Generation,
  patch: Record<string, unknown>,
): Generation {
  const next = { ...current };
  if (isGenerationStatus(patch.status)) next.status = patch.status;
  if (typeof patch.result_url === "string" || patch.result_url === null) {
    next.result_url = patch.result_url;
  }
  if (typeof patch.error_message === "string" || patch.error_message === null) {
    next.error_message = patch.error_message;
  }
  if (typeof patch.completed_at === "string" || patch.completed_at === null) {
    next.completed_at = patch.completed_at;
  }
  if (patch.mannequin_profile && typeof patch.mannequin_profile === "object") {
    next.mannequin_profile = patch.mannequin_profile as Record<string, unknown>;
  }
  return next;
}

export function useGenerationStatus(initial: Generation) {
  const queryClient = useQueryClient();
  const initialRef = useRef(initial);
  initialRef.current = initial;

  const query = useQuery({
    queryKey: ["generation", initial.id],
    queryFn: () => fetchGeneration(initial.id),
    initialData: initial,
    staleTime: isGenerationActive(initial.status) ? 0 : 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: isGenerationActive(initial.status),
    refetchInterval: (current) => {
      const status = current.state.data?.status;
      return status && isGenerationActive(status) ? 2500 : false;
    },
  });

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase.channel(
      `generation-${initial.id}-${crypto.randomUUID()}`,
    );
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "generations",
        filter: `id=eq.${initial.id}`,
      },
      (payload) => {
        queryClient.setQueryData(
          ["generation", initial.id],
          (current: Generation | undefined) =>
            applyRealtimePatch(
              current ?? initialRef.current,
              payload.new as Record<string, unknown>,
            ),
        );
      },
    );
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [initial.id, queryClient]);

  return query.data ?? initial;
}
