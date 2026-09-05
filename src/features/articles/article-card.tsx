"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { CloudinaryImage } from "@/components/media/cloudinary-image";
import { articleLabel, formatStudioDate } from "@/lib/format";
import type { Article } from "@/types/api";

export function ArticleCard({ article }: { article: Article }) {
  const t = useTranslations("article");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const title = articleLabel(article, tCommon("unnamed"));
  const src = article.cover_url || article.image_url;
  const date = formatStudioDate(article.created_at, locale);

  return (
    <Link
      href={`/articles/${article.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 transition-shadow hover:ring-foreground/16"
    >
      <div className="relative aspect-[3/4] bg-muted">
        <CloudinaryImage
          src={src}
          alt={title}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="space-y-1 p-4">
        <h2 className="truncate font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">
          {t("rawPhoto")}
          {date ? ` · ${date}` : ""}
        </p>
      </div>
    </Link>
  );
}
