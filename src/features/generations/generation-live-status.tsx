"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { GenerationPipeline } from "@/features/generations/generation-pipeline";
import { GenerationResultCard } from "@/features/generations/generation-result-card";
import { ShareBar } from "@/features/generations/share-bar";
import { StatusBadge } from "@/features/generations/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOTION_DURATION, useMotionEnabled } from "@/components/motion/presence";
import { useGenerationStatus } from "@/hooks/use-generation-status";
import { useLocale, useTranslations } from "next-intl";
import { generationFailureMessage, formatStudioDate, shortRef } from "@/lib/format";
import { drecLabel } from "@/lib/pricing";
import { isGenerationActive } from "@/lib/generation";
import type { Generation } from "@/types/api";

export function GenerationLiveStatus({
  initial,
  originalUrl,
  title,
}: {
  initial: Generation;
  originalUrl: string;
  title: string;
}) {
  const generation = useGenerationStatus(initial);
  const enabled = useMotionEnabled();
  const t = useTranslations("generation");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  if (isGenerationActive(generation.status)) {
    return (
      <div className="space-y-6">
        <Link
          href="/studio?tab=visuels"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {tCommon("myStudio")}
        </Link>
        <GenerationPipeline
          status={generation.status}
          outputKind={generation.output_kind}
        />
      </div>
    );
  }

  if (generation.status === "failed") {
    return (
      <div className="space-y-6">
        <Link
          href="/studio?tab=visuels"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {tCommon("myStudio")}
        </Link>
        <motion.div
          className="mx-auto max-w-lg space-y-6 py-16 text-center"
          initial={false}
          animate={enabled ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
          transition={{ duration: 0.28 }}
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <RefreshCwIcon className="size-7 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("failedTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("failedBody", {
                reason: generationFailureMessage(
                  generation.error_message,
                  tErrors,
                ),
              })}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={`/articles/${generation.article_id}`}
              className={cn(buttonVariants(), "h-11 rounded-xl gap-2")}
            >
              <RefreshCwIcon className="size-4" />
              {tCommon("retry")}
            </Link>
            <Link
              href="/studio?tab=visuels"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl",
              )}
            >
              {t("backStudio")}
            </Link>
          </div>
          <GenerationMeta generation={generation} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/studio?tab=visuels"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
          {tCommon("myStudio")}
      </Link>

      <motion.div
        className="mx-auto max-w-3xl space-y-8"
        initial={enabled ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_DURATION * 1.5, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            title={
              generation.output_kind === "video"
                ? t("readyVideoTitle")
                : t("readyImageTitle")
            }
            subtitle={title}
          />
          {generation.result_url ? (
            <motion.div
              initial={enabled ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: MOTION_DURATION }}
            >
              <ShareBar
                url={generation.result_url}
                kind={generation.output_kind}
                title={title}
                generationId={generation.id}
              />
            </motion.div>
          ) : null}
        </div>

        <motion.div
          initial={enabled ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: MOTION_DURATION * 1.5 }}
        >
          <GenerationResultCard
            originalUrl={originalUrl}
            generation={generation}
          />
        </motion.div>

        <motion.div
          initial={enabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: MOTION_DURATION }}
        >
          <GenerationMeta generation={generation} />
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-3"
          initial={enabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: MOTION_DURATION }}
        >
          <Link
            href={`/articles/${generation.article_id}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 rounded-xl gap-2",
            )}
          >
            {t("seeOriginal")}
          </Link>
          <Link
            href="/articles/new"
            className={cn(buttonVariants(), "h-10 rounded-xl gap-2")}
          >
            {t("newVisual")}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function GenerationMeta({ generation }: { generation: Generation }) {
  const locale = useLocale();
  const t = useTranslations("generation");
  const date = formatStudioDate(generation.created_at, locale);
  const completedDate = formatStudioDate(generation.completed_at, locale);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <StatusBadge status={generation.status} />
      <span>
        {generation.output_kind === "video" ? t("video") : t("photo")}
      </span>
      <span>{drecLabel(generation.cost_drecs)}</span>
      <span className="font-mono">{shortRef(generation.id)}</span>
      {date && <span>{t("createdOn", { date })}</span>}
      {completedDate && generation.status === "completed" && (
        <span>{t("completedOn", { date: completedDate })}</span>
      )}
    </div>
  );
}
