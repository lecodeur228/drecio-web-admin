"use client";

import { useTranslations } from "next-intl";

import { isDesignMode } from "@/lib/supabase/config";

export function DesignModeBanner() {
  const t = useTranslations("auth");
  if (!isDesignMode()) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-[0.75rem] border border-primary/25 bg-accent px-4 py-2.5 text-center text-sm text-foreground"
    >
      {t("designMode")}
    </div>
  );
}
