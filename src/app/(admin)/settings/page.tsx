import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ExternalLinkIcon, UsersIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  AdminPreferencesCard,
  AdminProfileForm,
} from "@/features/admin/admin-settings-form";
import { getMe } from "@/lib/api/users";

const SELLER_APP_URL =
  process.env.NEXT_PUBLIC_SELLER_APP_URL ?? "http://localhost:3000";

export default async function AdminSettingsPage() {
  const t = await getTranslations("admin.settings");
  const me = await getMe();

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <div>
            <h2 className="text-lg font-medium">{t("profileTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("profileHint")}</p>
          </div>
          <AdminProfileForm
            email={me.email}
            displayName={me.display_name}
            phone={me.phone}
            role={me.roles.join(", ") || "—"}
          />
        </section>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
            <div>
              <h2 className="text-lg font-medium">{t("prefsTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("prefsHint")}</p>
            </div>
            <AdminPreferencesCard />
          </section>

          <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
            <div>
              <h2 className="text-lg font-medium">{t("linksTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("linksHint")}</p>
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
                </Link>
              </li>
              <li>
                <a
                  href={SELLER_APP_URL}
                  className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm hover:bg-muted"
                >
                  <ExternalLinkIcon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{t("linkStudio")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("linkStudioHint")}
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
