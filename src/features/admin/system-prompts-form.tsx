"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

import {
  adminSavePrompts,
  type AdminActionState,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AdminSystemConfig } from "@/types/admin";

const FRAMING_KEYS = [
  "shoes",
  "top",
  "bottom",
  "dress",
  "accessory",
  "unknown",
] as const;

type PromptTab = "tryon" | "video";

export function SystemPromptsForm({ config }: { config: AdminSystemConfig }) {
  const t = useTranslations("admin.system");
  const [tab, setTab] = useState<PromptTab>("tryon");
  const [framingKey, setFramingKey] = useState<(typeof FRAMING_KEYS)[number]>("shoes");
  const [state, action, pending] = useActionState(
    adminSavePrompts,
    {} as AdminActionState,
  );

  const tabs: { id: PromptTab; label: string }[] = [
    { id: "tryon", label: t("promptTabTryon") },
    { id: "video", label: t("promptTabVideo") },
  ];

  return (
    <form action={action} className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("promptsHint")}</p>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "h-10 rounded-xl px-4 text-sm",
              tab === item.id
                ? "bg-foreground text-background"
                : "bg-card ring-1 ring-foreground/10 hover:bg-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Always submit all prompt fields; only one group visible */}
      <div className={cn("space-y-4", tab !== "tryon" && "hidden")}>
        <div className="space-y-2 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <Label htmlFor="prompt_mannequin">{t("promptMannequin")}</Label>
          <textarea
            id="prompt_mannequin"
            name="prompt_mannequin"
            defaultValue={config.prompt_mannequin}
            rows={5}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <p className="text-sm font-medium">{t("promptFramingGroup")}</p>
          <div className="flex flex-wrap gap-2">
            {FRAMING_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFramingKey(key)}
                className={cn(
                  "h-9 rounded-lg px-3 text-xs",
                  framingKey === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {key}
              </button>
            ))}
          </div>
          {FRAMING_KEYS.map((key) => (
            <div key={key} className={cn(framingKey !== key && "hidden")}>
              <Label htmlFor={`prompt_framing_${key}`}>
                {t("promptFraming", { category: key })}
              </Label>
              <textarea
                id={`prompt_framing_${key}`}
                name={`prompt_framing_${key}`}
                defaultValue={config.prompt_framing?.[key] ?? ""}
                rows={5}
                className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className={cn("space-y-4", tab !== "video" && "hidden")}>
        <div className="space-y-2 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <Label htmlFor="prompt_video_base">{t("promptVideoBase")}</Label>
          <textarea
            id="prompt_video_base"
            name="prompt_video_base"
            defaultValue={config.prompt_video_base}
            rows={4}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <Label htmlFor="prompt_video_shoes_suffix">{t("promptVideoShoes")}</Label>
          <textarea
            id="prompt_video_shoes_suffix"
            name="prompt_video_shoes_suffix"
            defaultValue={config.prompt_video_shoes_suffix}
            rows={3}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <Label htmlFor="prompt_video_default_suffix">{t("promptVideoDefault")}</Label>
          <textarea
            id="prompt_video_default_suffix"
            name="prompt_video_default_suffix"
            defaultValue={config.prompt_video_default_suffix}
            rows={2}
            className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-foreground">{t("saved")}</p> : null}

      <Button type="submit" disabled={pending} className="h-11 rounded-xl">
        {pending ? t("saving") : t("savePrompts")}
      </Button>
    </form>
  );
}
