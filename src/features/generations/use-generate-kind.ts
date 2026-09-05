"use client";

import { useState } from "react";

import { costForGeneration } from "@/lib/pricing";
import type { OutputKind } from "@/types/api";
import type { VariantCount } from "@/features/generations/output-kind-picker";

export function useGenerateKind(drecs: number, initialHasLogo = false) {
  const [kind, setKind] = useState<OutputKind>("image");
  const [variantCount, setVariantCount] = useState<VariantCount>(1);
  const [watermark, setWatermark] = useState(false);
  const [hasLogo, setHasLogo] = useState(initialHasLogo);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const cost = costForGeneration(kind, variantCount);
  const remaining = Math.max(0, drecs - cost);
  const insufficient = drecs < cost;

  function requestWatermark(next: boolean) {
    if (!next) {
      setWatermark(false);
      return;
    }
    if (kind !== "image") return;
    if (!hasLogo) {
      setLogoDialogOpen(true);
      return;
    }
    setWatermark(true);
  }

  function onLogoUploaded() {
    setHasLogo(true);
    setWatermark(true);
    setLogoDialogOpen(false);
  }

  return {
    kind,
    setKind: (next: OutputKind) => {
      setKind(next);
      if (next === "video") setWatermark(false);
    },
    variantCount,
    setVariantCount,
    watermark,
    requestWatermark,
    hasLogo,
    logoDialogOpen,
    setLogoDialogOpen,
    onLogoUploaded,
    rechargeOpen,
    setRechargeOpen,
    cost,
    remaining,
    insufficient,
  };
}
