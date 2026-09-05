"use client";

import { useLocale, useTranslations } from "next-intl";

import { formatFcfa, formatStudioDate } from "@/lib/format";
import type { CreditTransaction } from "@/types/api";

export function TransactionList({ items }: { items: CreditTransaction[] }) {
  const t = useTranslations("credits");
  const locale = useLocale();

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("emptyHistory")}</p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {item.type === "credit" ? t("typeCredit") : t("typeDebit")} ·{" "}
              {t(
                item.status === "pending"
                  ? "statusPending"
                  : item.status === "completed"
                    ? "statusCompleted"
                    : item.status === "failed"
                      ? "statusFailed"
                      : "statusRefunded",
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatStudioDate(item.created_at, locale)}
              {item.montant_fcfa
                ? ` · ${formatFcfa(item.montant_fcfa, locale)}`
                : ""}
            </p>
          </div>
          <p className="shrink-0 tabular-nums text-sm font-medium">
            {item.type === "debit" ? "−" : "+"}
            {item.montant_drecs}
          </p>
        </li>
      ))}
    </ul>
  );
}
