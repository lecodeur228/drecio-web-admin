"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/features/i18n/set-locale";
import { locales, type Locale } from "@/i18n/config";

export function LocaleSwitcher({ compact = true }: { compact?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pick(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const label = locale === "en" ? "EN" : "FR";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className="rounded-xl font-medium tracking-wide"
            disabled={pending}
            aria-label={t("language")}
          />
        }
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => pick(item)}
            className={item === locale ? "font-medium" : undefined}
          >
            {item === "fr" ? t("french") : t("english")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
