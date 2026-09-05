import type { GenerationStatus } from "@/types/api";

export function isGenerationActive(status: GenerationStatus): boolean {
  return status === "pending" || status === "processing";
}
