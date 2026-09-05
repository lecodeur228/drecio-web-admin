import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { GenerationRefundButton } from "@/features/admin/generation-refund-button";
import { listAdminGenerations } from "@/lib/api/admin";
import { formatStudioDateTime } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const STATUSES = ["", "failed", "pending", "processing", "completed"] as const;

export default async function AdminGenerationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getTranslations("admin.generations");
  const params = await searchParams;
  const status =
    params.status && STATUSES.includes(params.status as (typeof STATUSES)[number])
      ? params.status
      : undefined;
  const generations = await listAdminGenerations({ status, limit: 50 });

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((value) => {
          const active = (status ?? "") === value;
          const href = value ? `/generations?status=${value}` : "/generations";
          const label =
            value === ""
              ? t("statusAll")
              : t(`status.${value}` as "status.failed");
          return (
            <Link
              key={value || "all"}
              href={href}
              className={cn(
                "inline-flex h-8 items-center rounded-xl px-3 text-sm ring-1 transition-colors",
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground ring-foreground/10 hover:bg-muted",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {generations.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/8">
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
          {generations.map((gen) => (
            <li
              key={gen.id}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{gen.user_email}</p>
                  <Badge
                    variant={
                      gen.status === "failed"
                        ? "destructive"
                        : gen.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {t(`status.${gen.status}` as "status.failed")}
                  </Badge>
                  <Badge variant="outline">{gen.output_kind}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {gen.article_title || gen.article_categorie || "—"} ·{" "}
                  {drecLabel(gen.cost_drecs)} ·{" "}
                  {formatStudioDateTime(gen.created_at)}
                </p>
                {gen.error_message ? (
                  <p className="line-clamp-2 text-xs text-destructive">
                    {gen.error_message}
                  </p>
                ) : null}
              </div>
              <GenerationRefundButton
                generationId={gen.id}
                canRefund={gen.status === "failed"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
