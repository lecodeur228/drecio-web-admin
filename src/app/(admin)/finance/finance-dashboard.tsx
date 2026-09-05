import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  AlertTriangleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  getAdminFinanceSummary,
  listAdminTransactions,
} from "@/lib/api/admin";
import { formatFcfa, formatStudioDateTime } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { AdminTransactionListItem } from "@/types/admin";

import {
  FinanceNavLink,
  FinancePendingProvider,
  FinancePendingSurface,
} from "./finance-pending";

const STATUSES = ["", "completed", "pending", "failed", "refunded"] as const;
const TYPES = ["", "credit", "debit"] as const;
const PAGE_SIZE = 40;

function utcMonthStartIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
}

function buildFinanceHref(parts: {
  status?: string;
  type?: string;
  period?: "month" | "all";
  offset?: number;
}): string {
  const search = new URLSearchParams();
  if (parts.period === "all") search.set("period", "all");
  if (parts.status) search.set("status", parts.status);
  if (parts.type) search.set("type", parts.type);
  if (parts.offset && parts.offset > 0) search.set("offset", String(parts.offset));
  const q = search.toString();
  return q ? `/finance?${q}` : "/finance";
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <FinanceNavLink
      href={href}
      active={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-sm transition-colors",
        active
          ? "bg-background font-medium text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
      )}
    >
      {children}
    </FinanceNavLink>
  );
}

function amountPrimary(tx: AdminTransactionListItem): {
  main: string;
  sub: string | null;
  positive: boolean;
} {
  if (tx.montant_fcfa != null) {
    return {
      main: formatFcfa(tx.montant_fcfa),
      sub: drecLabel(tx.montant_drecs),
      positive: tx.type === "credit",
    };
  }
  return {
    main: drecLabel(tx.montant_drecs),
    sub: null,
    positive: tx.type === "credit",
  };
}

export async function FinanceDashboard({
  params,
}: {
  params: {
    status?: string;
    type?: string;
    period?: string;
    offset?: string;
  };
}) {
  const t = await getTranslations("admin.finance");
  const locale = await getLocale();

  const status =
    params.status &&
    STATUSES.includes(params.status as (typeof STATUSES)[number])
      ? (params.status as Exclude<(typeof STATUSES)[number], "">)
      : undefined;
  const type =
    params.type && TYPES.includes(params.type as (typeof TYPES)[number])
      ? (params.type as Exclude<(typeof TYPES)[number], "">)
      : undefined;
  const periodAll = params.period === "all";
  const offsetRaw = Number.parseInt(params.offset ?? "0", 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;
  const period: "month" | "all" = periodAll ? "all" : "month";
  const monthStart = utcMonthStartIso();

  const [summary, transactions] = await Promise.all([
    getAdminFinanceSummary(),
    listAdminTransactions({
      status,
      type,
      created_after: periodAll ? undefined : monthStart,
      limit: PAGE_SIZE,
      offset,
    }),
  ]);

  const periodStats = periodAll ? summary.all_time : summary.month;
  const monthLabel = new Date(summary.month_start).toLocaleDateString(
    locale === "en" ? "en-GB" : "fr-FR",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
  const hasStale = summary.stale_pending_topups.length > 0;
  const pageFrom = offset + 1;
  const pageTo = offset + transactions.length;

  return (
    <FinancePendingProvider>
      <FinancePendingSurface className="space-y-8">
        <div
          className="inline-flex rounded-2xl bg-muted/60 p-1 ring-1 ring-foreground/8"
          role="tablist"
          aria-label={t("periodLabel")}
        >
          <FinanceNavLink
            href={buildFinanceHref({ status, type, period: "month" })}
            active={!periodAll}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              !periodAll
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("periodMonth", { month: monthLabel })}
          </FinanceNavLink>
          <FinanceNavLink
            href={buildFinanceHref({ status, type, period: "all" })}
            active={periodAll}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              periodAll
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("periodAll")}
          </FinanceNavLink>
        </div>

        <section className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/8">
          <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2 border-b border-border px-6 py-7 lg:border-r lg:border-b-0">
              <p className="text-sm text-muted-foreground">
                {periodAll ? t("heroRevenueAll") : t("heroRevenueMonth")}
              </p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                {formatFcfa(periodStats.revenue_fcfa)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("topupsOk", { count: periodStats.topup_completed })}
                {!periodAll ? (
                  <>
                    {" · "}
                    {t("heroVsTotal", {
                      total: formatFcfa(summary.all_time.revenue_fcfa),
                    })}
                  </>
                ) : null}
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border">
              <FinanceNavLink
                href={buildFinanceHref({
                  status: "completed",
                  type: "credit",
                  period,
                })}
                className="flex flex-col justify-center gap-1 px-4 py-5 transition-colors hover:bg-muted/40"
              >
                <p className="text-xs text-muted-foreground">{t("kpiOk")}</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {periodStats.topup_completed}
                </p>
              </FinanceNavLink>
              <FinanceNavLink
                href={buildFinanceHref({
                  status: "pending",
                  type: "credit",
                  period,
                })}
                className={cn(
                  "flex flex-col justify-center gap-1 px-4 py-5 transition-colors hover:bg-muted/40",
                  periodStats.topup_pending > 0 && "bg-amber-500/5",
                )}
              >
                <p className="text-xs text-muted-foreground">{t("kpiPending")}</p>
                <p
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    periodStats.topup_pending > 0 &&
                      "text-amber-700 dark:text-amber-400",
                  )}
                >
                  {periodStats.topup_pending}
                </p>
              </FinanceNavLink>
              <FinanceNavLink
                href={buildFinanceHref({
                  status: "failed",
                  type: "credit",
                  period,
                })}
                className={cn(
                  "flex flex-col justify-center gap-1 px-4 py-5 transition-colors hover:bg-muted/40",
                  periodStats.topup_failed > 0 && "bg-destructive/5",
                )}
              >
                <p className="text-xs text-muted-foreground">{t("kpiFailed")}</p>
                <p
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    periodStats.topup_failed > 0 && "text-destructive",
                  )}
                >
                  {periodStats.topup_failed}
                </p>
              </FinanceNavLink>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 px-5 py-4 ring-1 ring-foreground/6">
          <div>
            <p className="text-sm font-medium">{t("drecsTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("drecsHint")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="tabular-nums">
              <span className="text-muted-foreground">{t("drecsIn")} </span>
              <span className="font-medium">
                {drecLabel(periodStats.drecs_credited)}
              </span>
            </span>
            <span className="tabular-nums">
              <span className="text-muted-foreground">{t("drecsOut")} </span>
              <span className="font-medium">
                {drecLabel(periodStats.drecs_debited)}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {t("drecPrice", { price: formatFcfa(summary.drec_price_fcfa) })}
            </span>
          </div>
        </section>

        {hasStale ? (
          <section className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">{t("staleTitle")}</p>
                  <p className="text-xs text-muted-foreground">{t("staleHint")}</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {summary.stale_pending_topups.slice(0, 3).map((tx) => (
                      <li key={tx.id} className="truncate">
                        {tx.user_email} · {formatFcfa(tx.montant_fcfa ?? 0)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <FinanceNavLink
                href={buildFinanceHref({
                  status: "pending",
                  type: "credit",
                  period: "all",
                })}
                className="shrink-0 self-start rounded-xl bg-background px-3 py-2 text-sm font-medium ring-1 ring-foreground/10 hover:bg-muted"
              >
                {t("staleLink")}
              </FinanceNavLink>
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-medium">
              {t("listTitle")}
              {transactions.length > 0 ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {t("listCount", { from: pageFrom, to: pageTo })}
                </span>
              ) : null}
            </h2>
            {status || type ? (
              <FinanceNavLink
                href={buildFinanceHref({ period })}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t("clearFilters")}
              </FinanceNavLink>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-2 ring-1 ring-foreground/6 sm:flex-row sm:items-center sm:gap-0">
            <div
              className="flex gap-1 overflow-x-auto"
              role="group"
              aria-label={t("filterStatus")}
            >
              {STATUSES.map((value) => (
                <FilterChip
                  key={value || "all-status"}
                  href={buildFinanceHref({
                    status: value || undefined,
                    type,
                    period,
                  })}
                  active={(status ?? "") === value}
                >
                  {value === ""
                    ? t("statusAll")
                    : t(`status.${value}` as "status.completed")}
                </FilterChip>
              ))}
            </div>

            <div
              className="hidden h-6 w-px shrink-0 bg-foreground/10 sm:mx-2 sm:block"
              aria-hidden
            />

            <div
              className="flex gap-1 overflow-x-auto border-t border-foreground/8 pt-2 sm:border-0 sm:pt-0"
              role="group"
              aria-label={t("filterType")}
            >
              {TYPES.map((value) => (
                <FilterChip
                  key={value || "all-type"}
                  href={buildFinanceHref({
                    status,
                    type: value || undefined,
                    period,
                  })}
                  active={(type ?? "") === value}
                >
                  {value === ""
                    ? t("typeAll")
                    : t(`type.${value}` as "type.credit")}
                </FilterChip>
              ))}
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-3xl bg-card px-6 py-14 text-center ring-1 ring-foreground/8">
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
              {status || type ? (
                <FinanceNavLink
                  href={buildFinanceHref({ period })}
                  className="mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline"
                >
                  {t("clearFilters")}
                </FinanceNavLink>
              ) : null}
            </div>
          ) : (
            <ul className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/8">
              <li className="hidden border-b border-border bg-muted/30 px-5 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(7rem,auto)_minmax(6rem,auto)] sm:gap-4">
                <span>{t("colUser")}</span>
                <span className="text-right">{t("colAmount")}</span>
                <span>{t("colStatus")}</span>
                <span className="text-right">{t("colDate")}</span>
              </li>

              {transactions.map((tx) => {
                const amount = amountPrimary(tx);
                const Icon =
                  tx.type === "credit" ? ArrowDownLeftIcon : ArrowUpRightIcon;
                return (
                  <li
                    key={tx.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <a
                      href={`/users/${tx.user_id}`}
                      className="grid gap-2 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(7rem,auto)_minmax(6rem,auto)] sm:items-center sm:gap-4 sm:px-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                            tx.type === "credit"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {tx.user_display_name || tx.user_email}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {tx.user_display_name ? tx.user_email : null}
                            {tx.fedapay_reference
                              ? `${tx.user_display_name ? " · " : ""}${tx.fedapay_reference}`
                              : null}
                            {!tx.user_display_name && !tx.fedapay_reference
                              ? t(`type.${tx.type}` as "type.credit")
                              : null}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-3 pl-11 sm:flex-col sm:items-end sm:pl-0">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums sm:text-base",
                            amount.positive
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-foreground",
                          )}
                        >
                          {amount.positive ? "+" : "−"}
                          {amount.main}
                        </span>
                        {amount.sub ? (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {amount.sub}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {t(`type.${tx.type}` as "type.credit")}
                          </span>
                        )}
                      </div>

                      <div className="pl-11 sm:pl-0">
                        <Badge
                          variant={
                            tx.status === "failed"
                              ? "destructive"
                              : tx.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {t(`status.${tx.status}` as "status.completed")}
                        </Badge>
                      </div>

                      <div className="pl-11 text-xs text-muted-foreground sm:pl-0 sm:text-right">
                        {formatStudioDateTime(tx.created_at, locale)}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {(offset > 0 || transactions.length >= PAGE_SIZE) && (
            <div className="flex items-center justify-between gap-3 pt-1">
              {offset > 0 ? (
                <FinanceNavLink
                  href={buildFinanceHref({
                    status,
                    type,
                    period,
                    offset: Math.max(0, offset - PAGE_SIZE),
                  })}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium ring-1 ring-foreground/10 hover:bg-muted"
                >
                  <ChevronLeftIcon className="size-4" />
                  {t("prev")}
                </FinanceNavLink>
              ) : (
                <span />
              )}
              {transactions.length >= PAGE_SIZE ? (
                <FinanceNavLink
                  href={buildFinanceHref({
                    status,
                    type,
                    period,
                    offset: offset + PAGE_SIZE,
                  })}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium ring-1 ring-foreground/10 hover:bg-muted"
                >
                  {t("next")}
                  <ChevronRightIcon className="size-4" />
                </FinanceNavLink>
              ) : null}
            </div>
          )}
        </section>
      </FinancePendingSurface>
    </FinancePendingProvider>
  );
}
