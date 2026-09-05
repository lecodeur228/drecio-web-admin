"use client";

import Link from "next/link";

import { useCreditsBalance } from "@/hooks/use-credits-balance";
import { drecLabel } from "@/lib/pricing";
import { useTranslations } from "next-intl";

export function SidebarBalance({ initialBalance }: { initialBalance: number }) {
  const balance = useCreditsBalance(initialBalance);
  const t = useTranslations("nav");

  return (
    <Link
      href="/credits"
      className="hidden rounded-2xl bg-background px-3 py-3 ring-1 ring-foreground/8 sm:block"
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {t("balance")}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{balance}</p>
      <p className="text-xs text-muted-foreground">{drecLabel(balance)}</p>
    </Link>
  );
}
