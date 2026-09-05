import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { getAdminOverview } from "@/lib/api/admin";
import { formatFcfa, formatStudioDateTime } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const PERIODS = [7, 30, 90] as const;

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warn" | "ok";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card px-4 py-4 ring-1",
        tone === "warn"
          ? "ring-destructive/25"
          : tone === "ok"
            ? "ring-foreground/8"
            : "ring-foreground/8",
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
          tone === "warn" && "text-destructive",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-medium">{title}</h2>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const t = await getTranslations("admin.overview");
  const params = await searchParams;
  const days = Number.parseInt(params.days ?? "7", 10);
  const period = Number.isFinite(days) && days > 0 ? Math.min(days, 90) : 7;
  const data = await getAdminOverview(period);
  const failurePct = Math.round(data.generations_failure_rate * 100);
  const hasAlerts =
    data.stuck_generations > 0 ||
    data.recent_failures.length > 0 ||
    data.stale_pending_topups.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", { days: period })}
        actions={
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((d) => (
              <Link
                key={d}
                href={d === 7 ? "/" : `/?days=${d}`}
                className={cn(
                  "inline-flex h-9 items-center rounded-xl px-3 text-sm font-medium ring-1 transition-colors",
                  period === d
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-card text-foreground ring-foreground/10 hover:bg-muted",
                )}
              >
                {t("periodDays", { days: d })}
              </Link>
            ))}
          </div>
        }
      />

      <section className="space-y-4">
        <SectionTitle title={t("accountsTitle")} hint={t("accountsHint")} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label={t("usersTotal")} value={String(data.users_total)} />
          <StatCard
            label={t("usersNew")}
            value={String(data.users_new)}
            hint={t("usersNewHint", { days: period })}
          />
          <StatCard
            label={t("drecsSum")}
            value={drecLabel(data.drecs_balance_sum)}
            hint={t("drecsSumHint")}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title={t("activityTitle")} hint={t("activityHint")} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("gensTotal")}
            value={String(data.generations_total)}
          />
          <StatCard
            label={t("gensCompleted")}
            value={String(data.generations_completed)}
            tone="ok"
          />
          <StatCard
            label={t("gensFailed")}
            value={String(data.generations_failed)}
            hint={t("failureRate", { rate: failurePct })}
            tone={data.generations_failed > 0 ? "warn" : "default"}
          />
          <StatCard
            label={t("stuck")}
            value={String(data.stuck_generations)}
            hint={t("stuckHint")}
            tone={data.stuck_generations > 0 ? "warn" : "default"}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title={t("economyTitle")} hint={t("economyHint")} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("drecsDebited")}
            value={drecLabel(data.drecs_debited)}
          />
          <StatCard
            label={t("drecsCredited")}
            value={drecLabel(data.drecs_credited)}
          />
          <StatCard
            label={t("topupFcfa")}
            value={formatFcfa(data.topup_fcfa_completed)}
          />
          <StatCard
            label={t("topups")}
            value={String(data.topup_completed)}
            hint={t("topupsHint", {
              pending: data.topup_pending,
              failed: data.topup_failed,
            })}
            tone={
              data.topup_pending > 0 || data.topup_failed > 0
                ? "warn"
                : "default"
            }
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                hasAlerts ? "text-destructive" : "text-muted-foreground",
              )}
            />
            <div>
              <h2 className="text-lg font-medium">{t("alertsTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("alertsHint")}</p>
            </div>
          </div>

          {!hasAlerts ? (
            <p className="text-sm text-muted-foreground">{t("alertsEmpty")}</p>
          ) : (
            <div className="space-y-5">
              {data.stuck_generations > 0 ? (
                <p className="rounded-xl bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {t("stuckBanner", { count: data.stuck_generations })}
                </p>
              ) : null}

              {data.recent_failures.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("recentFailures")}
                  </p>
                  <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/8">
                    {data.recent_failures.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-start justify-between gap-2 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.user_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.article_title || item.article_categorie || "—"}{" "}
                            · {item.output_kind}
                          </p>
                          {item.error_message ? (
                            <p className="mt-1 line-clamp-2 text-xs text-destructive">
                              {item.error_message}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {formatStudioDateTime(item.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.stale_pending_topups.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("staleTopups")}
                  </p>
                  <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/8">
                    {data.stale_pending_topups.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.user_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.montant_fcfa != null
                              ? formatFcfa(item.montant_fcfa)
                              : drecLabel(item.montant_drecs)}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {formatStudioDateTime(item.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <div>
            <h2 className="text-lg font-medium">{t("shortcutsTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("shortcutsHint")}</p>
          </div>
          <ul className="space-y-3">
            <li>
              <Link
                href="/users"
                className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm hover:bg-muted"
              >
                <UsersIcon className="size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{t("linkUsers")}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("linkUsersHint")}
                  </span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
            <li>
              <Link
                href="/system/status"
                className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm hover:bg-muted"
              >
                <Settings2Icon className="size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{t("linkSystem")}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("linkSystemHint")}
                  </span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
