import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAdminUsers } from "@/lib/api/admin";
import { formatStudioDate } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/api";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const t = await getTranslations("admin.users");
  const params = await searchParams;
  const role =
    params.role === "admin" || params.role === "seller"
      ? (params.role as UserRole)
      : undefined;
  const users = await listAdminUsers({ q: params.q, role, limit: 50 });

  const roleFilters: { value: string; label: string }[] = [
    { value: "", label: t("roleAll") },
    { value: "seller", label: t("roleSeller") },
    { value: "admin", label: t("roleAdmin") },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <form className="space-y-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
        {role ? <input type="hidden" name="role" value={role} /> : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="q" className="text-xs text-muted-foreground">
              {t("searchLabel")}
            </label>
            <Input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder={t("search")}
              className="h-11 rounded-xl bg-background"
            />
          </div>
          <Button type="submit" className="h-11 rounded-xl px-5">
            {t("filter")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {roleFilters.map((filter) => {
            const active = (params.role ?? "") === filter.value;
            const href =
              filter.value === ""
                ? params.q
                  ? `/users?q=${encodeURIComponent(params.q)}`
                  : "/users"
                : `/users?role=${filter.value}${
                    params.q ? `&q=${encodeURIComponent(params.q)}` : ""
                  }`;
            return (
              <Link
                key={filter.value || "all"}
                href={href}
                className={cn(
                  "inline-flex h-8 items-center rounded-xl px-3 text-sm ring-1 transition-colors",
                  active
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-background text-foreground ring-foreground/10 hover:bg-muted",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </form>

      {users.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/8">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto_auto_auto] gap-3 border-b border-border px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid">
            <span>{t("colAccount")}</span>
            <span>{t("colDisplayName")}</span>
            <span>{t("colRole")}</span>
            <span className="text-right">{t("colArticles")}</span>
            <span className="text-right">{t("colGens")}</span>
            <span className="text-right">{t("colDrecs")}</span>
          </div>
          <ul className="divide-y divide-border">
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/users/${user.id}`}
                  className="grid gap-2 px-4 py-3 hover:bg-muted/50 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto_auto_auto] md:items-center md:gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {user.display_name || "—"} · {formatStudioDate(user.created_at)}
                    </p>
                    <p className="hidden text-xs text-muted-foreground md:block">
                      {formatStudioDate(user.created_at)}
                    </p>
                  </div>
                  <p className="hidden truncate text-sm text-muted-foreground md:block">
                    {user.display_name || "—"}
                  </p>
                  <div className="flex flex-wrap gap-1">
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
                  <p className="text-sm tabular-nums text-muted-foreground md:text-right">
                    <span className="md:hidden">{t("colArticles")}: </span>
                    {user.articles_count}
                  </p>
                  <p className="text-sm tabular-nums text-muted-foreground md:text-right">
                    <span className="md:hidden">{t("colGens")}: </span>
                    {user.generations_count}
                  </p>
                  <p className="text-sm font-medium tabular-nums md:text-right">
                    {drecLabel(user.drecs_balance)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {t("showing", { count: users.length })}
          </p>
        </div>
      )}
    </div>
  );
}
