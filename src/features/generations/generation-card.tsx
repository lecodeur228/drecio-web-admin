"use client";

import Image from "next/image";
import Link from "next/link";
import { RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatusBadge } from "@/features/generations/status-badge";
import { GenerationMedia } from "@/features/generations/generation-media";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shortRef } from "@/lib/format";
import type { Generation } from "@/types/api";

export function GenerationCard({
  generation,
  title,
}: {
  generation: Generation;
  title?: string;
}) {
  const t = useTranslations("generation");
  const tCommon = useTranslations("common");
  const isVideo = generation.output_kind === "video";
  const isFailed = generation.status === "failed";
  const label = title ?? tCommon("visual");

  return (
    <Link
      href={
        isFailed
          ? `/articles/${generation.article_id}`
          : `/generations/${generation.id}`
      }
      className="group overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 transition-shadow hover:ring-foreground/16"
    >
      <div className="relative aspect-[3/4] bg-muted">
        {isFailed ? (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-4">
            <Image
              src="/logo-icon.png"
              alt=""
              width={48}
              height={48}
              unoptimized
              className="opacity-30"
              aria-hidden
            />
            <span
              className={cn(
                buttonVariants({ size: "sm" }),
                "pointer-events-none h-8 gap-1.5 rounded-lg text-xs",
              )}
            >
              <RefreshCwIcon className="size-3.5" />
              {tCommon("retry")}
            </span>
          </div>
        ) : (
          <GenerationMedia
            src={generation.result_url}
            kind={generation.output_kind}
            alt={label}
            autoPlay={isVideo}
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          {isVideo && !isFailed ? (
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium">
              {t("video")}
            </span>
          ) : !isFailed ? (
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium">
              {t("photo")}
            </span>
          ) : null}
          <StatusBadge status={generation.status} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <span className="truncate text-sm font-medium">{label}</span>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {shortRef(generation.id)}
        </span>
      </div>
    </Link>
  );
}
