"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { GenerationMedia } from "@/features/generations/generation-media";
import { StatusBadge } from "@/features/generations/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatStudioDate, generationFailureMessage, shortRef } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";
import type { Generation } from "@/types/api";

export function GenerationRow({
  generation,
  title,
}: {
  generation: Generation;
  title: string;
}) {
  const locale = useLocale();
  const t = useTranslations("generation");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const date = formatStudioDate(generation.created_at, locale);
  const isVideo = generation.output_kind === "video";

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card p-3 ring-1 ring-foreground/8 sm:flex-row sm:items-stretch sm:p-4">
      <Link
        href={`/generations/${generation.id}`}
        className="relative mx-auto aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:mx-0 sm:w-32"
      >
        <GenerationMedia
          src={generation.result_url}
          kind={generation.output_kind}
          alt={title}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold tracking-tight">
                {title}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {shortRef(generation.id)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={generation.status} />
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {drecLabel(generation.cost_drecs)}
                {isVideo ? t("kindVideo") : ""}
              </span>
              {date ? (
                <span className="text-xs text-muted-foreground">{date}</span>
              ) : null}
            </div>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {generation.status === "failed"
            ? generationFailureMessage(generation.error_message, tErrors)
            : generation.status === "completed"
              ? isVideo
                ? t("readyVideo")
                : t("readyImage")
              : t("working")}
        </p>

        <div className="mt-auto">
          <Link
            href={
              generation.status === "failed"
                ? `/articles/${generation.article_id}`
                : `/generations/${generation.id}`
            }
            className={cn(
              buttonVariants({
                size: "sm",
                variant: generation.status === "failed" ? "default" : "secondary",
              }),
              "h-9 min-w-24 rounded-xl px-4",
            )}
          >
            {generation.status === "failed" ? tCommon("retry") : tCommon("open")}
          </Link>
        </div>
      </div>
    </article>
  );
}
