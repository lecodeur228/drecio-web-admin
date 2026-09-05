"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  updateAdminProfile,
  type AdminSettingsState,
} from "@/features/admin/settings-actions";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminProfileForm({
  email,
  displayName,
  phone,
  role,
}: {
  email: string;
  displayName: string | null;
  phone: string | null;
  role: string;
}) {
  const t = useTranslations("admin.settings");
  const [state, action, pending] = useActionState(
    updateAdminProfile,
    {} as AdminSettingsState,
  );

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          value={email}
          readOnly
          className="h-11 rounded-xl bg-muted"
        />
        <p className="text-xs text-muted-foreground">{t("emailHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">{t("role")}</Label>
        <Input
          id="role"
          value={role}
          readOnly
          className="h-11 rounded-xl bg-muted capitalize"
        />
        <p className="text-xs text-muted-foreground">{t("roleHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">{t("displayName")}</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName ?? ""}
          placeholder={t("displayPlaceholder")}
          className="h-11 rounded-xl bg-background"
        />
        <p className="text-xs text-muted-foreground">{t("displayHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          placeholder="+225 …"
          className="h-11 rounded-xl bg-background"
        />
        <p className="text-xs text-muted-foreground">{t("phoneHint")}</p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-foreground">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="h-11 rounded-xl">
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}

export function AdminPreferencesCard() {
  const t = useTranslations("admin.settings");

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{t("language")}</p>
        <p className="text-xs text-muted-foreground">{t("languageHint")}</p>
      </div>
      <LocaleSwitcher compact={false} />
    </div>
  );
}
