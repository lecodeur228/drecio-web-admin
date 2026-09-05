"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

import { MOTION_DURATION, useMotionEnabled } from "@/components/motion/presence";
import { Progress } from "@/components/ui/progress";
import type { GenerationStatus, OutputKind } from "@/types/api";

export function GenerationPipeline({
  status,
  outputKind = "image",
}: {
  status: GenerationStatus;
  outputKind?: OutputKind;
}) {
  const t = useTranslations("generation");
  const enabled = useMotionEnabled();
  const isVideo = outputKind === "video";
  const processing = status === "processing";
  const step = processing
    ? {
        label: isVideo ? t("pipelineVideoProcessing") : t("pipelineImageProcessing"),
        hint: isVideo
          ? t("pipelineVideoProcessingHint")
          : t("pipelineImageProcessingHint"),
        value: isVideo ? 70 : 75,
      }
    : {
        label: isVideo ? t("pipelineVideoPending") : t("pipelineImagePending"),
        hint: isVideo ? t("pipelineVideoPendingHint") : t("pipelineImagePendingHint"),
        value: isVideo ? 25 : 35,
      };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-8 px-4 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.label}
          initial={enabled ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={enabled ? { opacity: 0, y: -8 } : undefined}
          transition={{ duration: MOTION_DURATION }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-semibold tracking-tight">{step.label}</h1>
          <p className="text-sm text-muted-foreground">{step.hint}</p>
        </motion.div>
      </AnimatePresence>
      <Progress value={step.value} className="w-full max-w-xs">
        <span className="sr-only">{step.label}</span>
      </Progress>
    </div>
  );
}
