import type { CreditTransaction, Generation } from "@/types/api";

export type UsageFilter = "all" | "visuels" | "credits";

export type UsageEvent =
  | {
      id: string;
      at: string;
      kind: "visuel";
      generation: Generation;
      title: string;
    }
  | {
      id: string;
      at: string;
      kind: "credit";
      transaction: CreditTransaction;
    };

export type UsageStats = {
  visuels: number;
  visuelsReady: number;
  drecsSpent: number;
  drecsAdded: number;
};

export function buildUsageEvents(
  generations: Generation[],
  titles: Record<string, string>,
  transactions: CreditTransaction[],
): UsageEvent[] {
  const visuels: UsageEvent[] = generations.map((generation) => ({
    id: `visuel-${generation.id}`,
    at: generation.created_at ?? "",
    kind: "visuel",
    generation,
    title: titles[generation.article_id] ?? "Visuel",
  }));

  const credits: UsageEvent[] = transactions
    .filter((item) => item.type === "credit")
    .map((transaction) => ({
      id: `credit-${transaction.id}`,
      at: transaction.created_at ?? "",
      kind: "credit" as const,
      transaction,
    }));

  return [...visuels, ...credits].sort((a, b) => {
    if (a.at === b.at) return 0;
    return a.at > b.at ? -1 : 1;
  });
}

export function filterUsageEvents(
  events: UsageEvent[],
  filter: UsageFilter,
): UsageEvent[] {
  if (filter === "all") return events;
  if (filter === "visuels") return events.filter((event) => event.kind === "visuel");
  return events.filter((event) => event.kind === "credit");
}

export function usageStats(
  generations: Generation[],
  transactions: CreditTransaction[],
): UsageStats {
  return {
    visuels: generations.length,
    visuelsReady: generations.filter((item) => item.status === "completed").length,
    drecsSpent: generations
      .filter((item) => item.status === "completed" || item.status === "processing")
      .reduce((sum, item) => sum + item.cost_drecs, 0),
    drecsAdded: transactions
      .filter((item) => item.type === "credit" && item.status === "completed")
      .reduce((sum, item) => sum + item.montant_drecs, 0),
  };
}
