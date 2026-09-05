"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";

export function CreditsRealtime({ initialBalance }: { initialBalance: number }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(["drecs-balance"], (current: { drecs_balance?: number } | undefined) => {
      if (current && typeof current.drecs_balance === "number") return current;
      return { drecs_balance: initialBalance };
    });
  }, [initialBalance, queryClient]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      channel = supabase.channel(`credits-sync-${user.id}-${crypto.randomUUID()}`);
      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `auth_id=eq.${user.id}`,
        },
        (payload) => {
          const next = (payload.new as { drecs_balance?: unknown }).drecs_balance;
          if (typeof next === "number") {
            queryClient.setQueryData(["drecs-balance"], { drecs_balance: next });
          }
        },
      );
      channel.subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
