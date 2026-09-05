import "server-only";

import { cache } from "react";

import type { CreditTransaction, TopupResponse } from "@/types/api";

import { api } from "./client";
import { endpoints } from "./endpoints";

export async function startTopup(drecs: number): Promise<TopupResponse> {
  return api<TopupResponse>(endpoints.credits.topup, {
    method: "POST",
    body: JSON.stringify({ drecs }),
  });
}

export const listTransactions = cache(async function listTransactions(): Promise<CreditTransaction[]> {
  return api<CreditTransaction[]>(endpoints.credits.transactions);
});
