"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { FilterPills } from "@/components/layout/filter-pills";
import { StatusBadge } from "@/features/generations/status-badge";
import { formatFcfa, formatStudioDateTime, shortRef } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";
import {
  filterUsageEvents,
  type UsageEvent,
  type UsageFilter,
} from "@/lib/usage";

export function UsageJournal({ events }: { events: UsageEvent[] }) {
  const t = useTranslations("journal");
  const tCredits = useTranslations("credits");
  const [filter, setFilter] = useState<UsageFilter>("all");
  const visible = useMemo(
    () => filterUsageEvents(events, filter),
    [events, filter],
  );

  const visuelCount = events.filter((event) => event.kind === "visuel").length;
  const creditCount = events.filter((event) => event.kind === "credit").length;

  return (
    <div className="space-y-4">
      <FilterPills
        value={filter}
        onChange={setFilter}
        items={[
          { id: "all", label: t("filterAll"), count: events.length },
          { id: "visuels", label: t("filterVisuals"), count: visuelCount },
          { id: "credits", label: t("filterCredits"), count: creditCount },
        ]}
      />

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-card px-5 py-12 text-center text-sm text-muted-foreground ring-1 ring-foreground/8">
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
          {visible.map((event) => (
            <li key={event.id}>
              {event.kind === "visuel" ? (
                <VisuelRow event={event} />
              ) : (
                <CreditRow event={event} statusLabel={creditStatus(event.transaction.status, tCredits)} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function creditStatus(
  status: string,
  t: ReturnType<typeof useTranslations<"credits">>,
): string {
  if (status === "pending") return t("statusPending");
  if (status === "completed") return t("statusCompleted");
  if (status === "failed") return t("statusFailed");
  if (status === "refunded") return t("statusRefunded");
  return status;
}

function VisuelRow({
  event,
}: {
  event: Extract<UsageEvent, { kind: "visuel" }>;
}) {
  const t = useTranslations("generation");
  const locale = useLocale();
  const { generation, title } = event;
  const kind = generation.output_kind === "video" ? t("video") : t("photo");
  const href =
    generation.status === "failed"
      ? `/articles/${generation.article_id}`
      : `/generations/${generation.id}`;

  return (
    <Link
      href={href}
      className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {kind} · {shortRef(generation.id)} ·{" "}
          {formatStudioDateTime(generation.created_at, locale)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm tabular-nums text-muted-foreground">
          −{drecLabel(generation.cost_drecs)}
        </span>
        <StatusBadge status={generation.status} />
      </div>
    </Link>
  );
}

function CreditRow({
  event,
  statusLabel,
}: {
  event: Extract<UsageEvent, { kind: "credit" }>;
  statusLabel: string;
}) {
  const t = useTranslations("journal");
  const locale = useLocale();
  const { transaction } = event;

  return (
    <Link
      href="/credits"
      className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium">{t("recharge")}</p>
        <p className="text-xs text-muted-foreground">
          {statusLabel}
          {transaction.montant_fcfa
            ? ` · ${formatFcfa(transaction.montant_fcfa, locale)}`
            : ""}
          {" · "}
          {formatStudioDateTime(transaction.created_at, locale)}
        </p>
      </div>
      <p className="shrink-0 text-sm font-medium tabular-nums">
        +{drecLabel(transaction.montant_drecs)}
      </p>
    </Link>
  );
}
