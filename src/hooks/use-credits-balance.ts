"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDrecsBalance } from "@/features/credits/actions";

export function useCreditsBalance(initialBalance: number) {
  const { data } = useQuery({
    queryKey: ["drecs-balance"],
    queryFn: fetchDrecsBalance,
    initialData: { drecs_balance: initialBalance },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return data?.drecs_balance ?? initialBalance;
}
