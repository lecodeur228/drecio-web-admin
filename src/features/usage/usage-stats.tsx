"use client";

import { useTranslations } from "next-intl";
import { drecLabel } from "@/lib/pricing";
import type { UsageStats } from "@/lib/usage";

export function UsageStatsRow({ stats }: { stats: UsageStats }) {
  const t = useTranslations("journal");
  const items = [
    { label: t("statVisuals"), value: String(stats.visuels) },
    { label: t("statReady"), value: String(stats.visuelsReady) },
    { label: t("statSpent"), value: drecLabel(stats.drecsSpent) },
    { label: t("statAdded"), value: drecLabel(stats.drecsAdded) },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/8"
        >
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
        </div>
      ))}
    </section>
  );
}
