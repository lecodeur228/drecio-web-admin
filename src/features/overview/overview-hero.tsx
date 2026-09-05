"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { useCreditsBalance } from "@/hooks/use-credits-balance";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { costHintValues, drecLabel } from "@/lib/pricing";

export function OverviewHero({ initialBalance }: { initialBalance: number }) {
  const balance = useCreditsBalance(initialBalance);
  const t = useTranslations("overview");
  const tPricing = useTranslations("pricing");
  const tCommon = useTranslations("common");

  return (
    <section className="flex flex-col justify-between gap-8 rounded-3xl bg-foreground px-6 py-8 text-background sm:flex-row sm:items-end sm:px-8 sm:py-10">
      <div className="space-y-2">
        <p className="text-sm text-background/70">{t("drecsBalance")}</p>
        <p className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
          {balance}
        </p>
        <p className="text-sm text-background/70">
          {t("payAsYouGo", { balance: drecLabel(balance) })}
        </p>
        <p className="text-sm text-background/55">{tPricing("costHint", costHintValues())}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/credits#recharger"
          className={cn(buttonVariants(), "h-11 rounded-xl px-5")}
        >
          {t("recharge")}
        </Link>
        <Link
          href="/articles/new"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 rounded-xl px-5 border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background",
          )}
        >
          {tCommon("newArticle")}
        </Link>
      </div>
    </section>
  );
}
