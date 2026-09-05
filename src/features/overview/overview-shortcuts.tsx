"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, CoinsIcon, ImagesIcon, PlusIcon, ScrollTextIcon } from "lucide-react";

export function OverviewShortcuts() {
  const t = useTranslations("overview");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const shortcuts = [
    {
      href: "/articles/new",
      title: tCommon("newArticle"),
      hint: t("shortcutNewHint"),
      icon: PlusIcon,
    },
    {
      href: "/studio?tab=visuels",
      title: tNav("studio"),
      hint: t("shortcutStudioHint"),
      icon: ImagesIcon,
    },
    {
      href: "/journal",
      title: tNav("journal"),
      hint: t("shortcutJournalHint"),
      icon: ScrollTextIcon,
    },
    {
      href: "/credits",
      title: tNav("credits"),
      hint: t("shortcutCreditsHint"),
      icon: CoinsIcon,
    },
  ] as const;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {shortcuts.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group flex items-start justify-between gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 transition-shadow hover:ring-foreground/16"
        >
          <div className="space-y-2">
            <item.icon className="size-5 text-muted-foreground" />
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.hint}</p>
          </div>
          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ))}
    </section>
  );
}
