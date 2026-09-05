"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  adminSaveFeatures,
  type AdminActionState,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import type { AdminSystemConfig } from "@/types/admin";

export function SystemFeaturesForm({ config }: { config: AdminSystemConfig }) {
  const t = useTranslations("admin.system");
  const [state, action, pending] = useActionState(
    adminSaveFeatures,
    {} as AdminActionState,
  );

  return (
    <form action={action} className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("flagsHint")}</p>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
        <li className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t("enableImage")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("enableImageHint")}</p>
          </div>
          <input
            type="checkbox"
            name="enable_image_generation"
            defaultChecked={config.enable_image_generation}
            className="mt-1 size-5 shrink-0 rounded border-input"
          />
        </li>
        <li className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t("enableVideo")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("enableVideoHint")}</p>
          </div>
          <input
            type="checkbox"
            name="enable_video_generation"
            defaultChecked={config.enable_video_generation}
            className="mt-1 size-5 shrink-0 rounded border-input"
          />
        </li>
      </ul>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-foreground">{t("saved")}</p> : null}

      <Button type="submit" disabled={pending} className="h-11 rounded-xl">
        {pending ? t("saving") : t("saveFeatures")}
      </Button>
    </form>
  );
}
