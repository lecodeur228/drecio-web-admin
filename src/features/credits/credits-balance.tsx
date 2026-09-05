"use client";

import { useCreditsBalance } from "@/hooks/use-credits-balance";
import { useTranslations } from "next-intl";
import { costHintValues } from "@/lib/pricing";

export function CreditsBalance({ initialBalance }: { initialBalance: number }) {
  const balance = useCreditsBalance(initialBalance);
  const t = useTranslations("credits");
  const tPricing = useTranslations("pricing");

  return (
    <div className="rounded-2xl bg-card px-6 py-8 ring-1 ring-foreground/8">
      <p className="text-sm text-muted-foreground">{t("yourDrecs")}</p>
      <p className="mt-2 text-5xl font-semibold tabular-nums sm:text-6xl">
        {balance}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        {tPricing("costHint", costHintValues())}
      </p>
    </div>
  );
}
