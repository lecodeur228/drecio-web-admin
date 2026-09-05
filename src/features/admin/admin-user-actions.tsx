"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  adminChangeRole,
  type AdminActionState,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/api";

export function AdminUserActions({
  userId,
  currentRoles,
}: {
  userId: string;
  currentRoles: string[];
}) {
  const t = useTranslations("admin.users");
  const [roleState, roleAction, rolePending] = useActionState(
    adminChangeRole,
    {} as AdminActionState,
  );
  const isAdmin = currentRoles.includes("admin");
  const nextRole: UserRole = isAdmin ? "seller" : "admin";
  const currentLabel = isAdmin ? t("roleAdmin") : t("roleSeller");
  const nextLabel = nextRole === "admin" ? t("roleAdmin") : t("roleSeller");

  return (
    <form
      action={roleAction}
      className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8"
    >
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="role" value={nextRole} />
      <div>
        <h3 className="font-medium">{t("changeRole")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("roleSwitch", { from: currentLabel, to: nextLabel })}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("currentRoles", { roles: currentRoles.join(", ") || "—" })}
        </p>
      </div>
      {roleState.error ? (
        <p className="text-sm text-destructive">{roleState.error}</p>
      ) : null}
      {roleState.success ? (
        <p className="text-sm text-foreground">{t("roleUpdated")}</p>
      ) : null}
      <Button
        type="submit"
        variant="outline"
        disabled={rolePending}
        className="h-11 rounded-xl"
      >
        {rolePending ? t("roleUpdating") : t("confirmRole")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("roleOnlyHint")}</p>
    </form>
  );
}
