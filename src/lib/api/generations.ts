import "server-only";

import { cache } from "react";

import type { Generation, OutputKind } from "@/types/api";

import { api } from "./client";
import { endpoints } from "./endpoints";

export async function requestGeneration(
  articleId: string,
  outputKind: OutputKind = "image",
  variantCount = 1,
  watermark = false,
): Promise<Generation> {
  const count =
    outputKind === "video" ? 1 : Math.max(1, Math.min(7, Math.floor(variantCount) || 1));
  return api<Generation>(endpoints.generations.collection, {
    method: "POST",
    body: JSON.stringify({
      article_id: articleId,
      output_kind: outputKind,
      variant_count: count,
      watermark: outputKind === "image" ? Boolean(watermark) : false,
    }),
  });
}

export const getGeneration = cache(async function getGeneration(
  id: string,
): Promise<Generation> {
  return api<Generation>(endpoints.generations.byId(id));
});

export const listGenerations = cache(async function listGenerations(
  articleId?: string,
): Promise<Generation[]> {
  return api<Generation[]>(endpoints.generations.list(articleId));
});
