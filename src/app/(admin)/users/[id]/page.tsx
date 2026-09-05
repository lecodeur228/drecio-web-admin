import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/features/admin/admin-user-actions";
import { ApiError } from "@/lib/api/errors";
import { getAdminUser } from "@/lib/api/admin";
import { formatStudioDateTime } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/8">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("admin.users");
  const { id } = await params;
  let user;
  try {
    user = await getAdminUser(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("back")}
        </Link>
        <PageHeader
          title={user.email}
          subtitle={user.display_name || t("noDisplayName")}
          actions={
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge
                  key={role}
                  variant={role === "admin" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {role === "admin" ? t("roleAdmin") : t("roleSeller")}
                </Badge>
              ))}
            </div>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">{t("profileTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("profileHint")}</p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoCard label={t("phone")} value={user.phone || "—"} />
            <InfoCard
              label={t("created")}
              value={formatStudioDateTime(user.created_at) || "—"}
            />
            <InfoCard
              label={t("colArticles")}
              value={String(user.articles_count)}
            />
            <InfoCard
              label={t("colGens")}
              value={String(user.generations_count)}
            />
            <InfoCard
              label={t("colDrecs")}
              value={drecLabel(user.drecs_balance)}
            />
          </dl>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">{t("accessTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("accessHint")}</p>
          </div>
          <AdminUserActions userId={user.id} currentRoles={user.roles} />
        </section>
      </div>
    </div>
  );
}
