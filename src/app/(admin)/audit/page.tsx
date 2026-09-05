import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { listAdminAudit } from "@/lib/api/admin";
import { formatStudioDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACTION_FILTERS = [
  { value: "", key: "actionAll" },
  { value: "sync_roles", key: "actionSyncRoles" },
  { value: "adjust_drecs", key: "actionAdjustDrecs" },
  { value: "refund_generation", key: "actionRefund" },
  { value: "patch_system_config", key: "actionSystemConfig" },
] as const;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const t = await getTranslations("admin.audit");
  const params = await searchParams;
  const matched = ACTION_FILTERS.find(
    (filter) => filter.value !== "" && filter.value === params.action,
  );
  const action = matched?.value;
  const logs = await listAdminAudit({ action, limit: 50 });

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map((filter) => {
          const active = (action ?? "") === filter.value;
          const href = filter.value
            ? `/audit?action=${filter.value}`
            : "/audit";
          return (
            <Link
              key={filter.key}
              href={href}
              className={cn(
                "inline-flex h-8 items-center rounded-xl px-3 text-sm ring-1 transition-colors",
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground ring-foreground/10 hover:bg-muted",
              )}
            >
              {t(filter.key)}
            </Link>
          );
        })}
      </div>

      {logs.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/8">
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
          {logs.map((log) => (
            <li key={log.id} className="space-y-1 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground">
                  {formatStudioDateTime(log.created_at)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("by", { email: log.admin_email })}
                {log.target_email
                  ? ` · ${t("target", { email: log.target_email })}`
                  : ""}
              </p>
              {log.reason ? (
                <p className="text-sm text-muted-foreground">{log.reason}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
