"use server";

import { getGeneration } from "@/lib/api/generations";

export async function fetchGeneration(id: string) {
  return getGeneration(id);
}
