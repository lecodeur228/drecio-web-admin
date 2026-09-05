import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";

import { FinanceDashboard } from "./finance-dashboard";

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    period?: string;
    offset?: string;
  }>;
}) {
  const t = await getTranslations("admin.finance");
  const params = await searchParams;
  const suspenseKey = [
    params.period ?? "month",
    params.status ?? "",
    params.type ?? "",
    params.offset ?? "0",
  ].join("|");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Suspense key={suspenseKey} fallback={<FinanceContentSkeleton />}>
        <FinanceDashboard params={params} />
      </Suspense>
    </div>
  );
}

function FinanceContentSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="h-11 w-64 animate-pulse rounded-2xl bg-muted" />
      <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      <div className="h-16 animate-pulse rounded-2xl bg-muted" />
      <div className="space-y-3">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 animate-pulse rounded-2xl bg-muted" />
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
