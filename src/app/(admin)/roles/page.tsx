import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { listAdminPermissions, listAdminRoles } from "@/lib/api/admin";

export default async function AdminRolesPage() {
  const t = await getTranslations("admin.roles");
  const [roles, permissions] = await Promise.all([
    listAdminRoles(),
    listAdminPermissions(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">{t("rolesTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("rolesHint")}</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {roles?.map((role) => (
            <article
              key={role.id}
              className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium capitalize">{role.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t("usersCount", { count: role.users_count })} · {role.guard_name}
                  </p>
                </div>
                <Badge variant={role.name === "admin" ? "default" : "secondary"}>
                  {t("permCount", { count: role.permissions?.length ?? 0 })}
                </Badge>
              </div>
              {(role.permissions?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noPerms")}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {role.permissions?.map((perm) => (
                    <li key={perm}>
                      <Badge variant="outline" className="font-mono text-xs">
                        {perm}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">{t("permsTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("permsHint")}</p>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
          {(permissions ?? []).map((perm) => (
            <li
              key={perm.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <span className="font-mono text-sm">{perm.name}</span>
              <span className="text-xs text-muted-foreground">{perm.guard_name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
