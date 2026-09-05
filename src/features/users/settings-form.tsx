"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  deleteLogoAction,
  updateDisplayName,
  uploadLogoAction,
  type SettingsState,
} from "@/features/users/actions";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMAGE_ACCEPT } from "@/lib/image-upload";

export function SettingsForm({
  email,
  displayName,
  logoUrl,
}: {
  email: string;
  displayName: string | null;
  logoUrl: string | null;
}) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [state, action, pending] = useActionState(
    updateDisplayName,
    {} as SettingsState,
  );
  const [logoState, logoAction, logoPending] = useActionState(
    uploadLogoAction,
    {} as SettingsState,
  );
  const [deleteMessage, setDeleteMessage] = useState<SettingsState>({});
  const [deleting, startDelete] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-md space-y-8">
      <form action={action} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            value={email}
            readOnly
            className="h-11 rounded-xl bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display_name">{t("displayName")}</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={displayName ?? ""}
            placeholder="Amavi"
            className="h-11 rounded-xl bg-background"
          />
          <p className="text-xs text-muted-foreground">{t("displayHint")}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">{tCommon("language")}</p>
          <p className="text-xs text-muted-foreground">{t("languageHint")}</p>
          <LocaleSwitcher compact={false} />
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

      <section className="space-y-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">{t("logo")}</h2>
          <p className="text-xs text-muted-foreground">{t("logoHint")}</p>
        </div>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={t("logoAlt")}
            className="h-16 w-auto rounded-lg bg-muted object-contain p-2"
          />
        ) : null}
        <form action={logoAction} className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            name="logo"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.[0]) {
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={logoPending || deleting}
            onClick={() => fileRef.current?.click()}
          >
            {logoPending
              ? t("logoUploading")
              : logoUrl
                ? t("logoChange")
                : t("logoUpload")}
          </Button>
          {logoUrl ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl"
              disabled={logoPending || deleting}
              onClick={() => {
                startDelete(async () => {
                  setDeleteMessage(await deleteLogoAction());
                });
              }}
            >
              {t("logoRemove")}
            </Button>
          ) : null}
        </form>
        {logoState.error || deleteMessage.error ? (
          <p className="text-sm text-destructive">
            {logoState.error || deleteMessage.error}
          </p>
        ) : null}
        {logoState.success || deleteMessage.success ? (
          <p className="text-sm text-foreground">
            {logoState.success || deleteMessage.success}
          </p>
        ) : null}
      </section>
    </div>
  );
}
