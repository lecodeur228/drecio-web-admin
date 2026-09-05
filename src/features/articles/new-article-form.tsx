"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { createArticleAndGenerate, type StudioActionState } from "@/features/articles/actions";
import { UploadDropzone } from "@/features/articles/upload-dropzone";
import { UploadProgressBar, useUploadProgress } from "@/features/articles/upload-progress";
import { RechargeDialog } from "@/features/credits/recharge-dialog";
import { LogoRequiredDialog } from "@/features/generations/logo-required-dialog";
import { OutputKindPicker } from "@/features/generations/output-kind-picker";
import { useGenerateKind } from "@/features/generations/use-generate-kind";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { drecLabel } from "@/lib/pricing";

export function NewArticleForm({
  drecs,
  hasLogo = false,
}: {
  drecs: number;
  hasLogo?: boolean;
}) {
  const t = useTranslations("article");
  const [file, setFile] = useState<File | null>(null);
  const {
    kind,
    setKind,
    variantCount,
    setVariantCount,
    watermark,
    requestWatermark,
    logoDialogOpen,
    setLogoDialogOpen,
    onLogoUploaded,
    rechargeOpen,
    setRechargeOpen,
    cost,
    remaining,
    insufficient,
  } = useGenerateKind(drecs, hasLogo);
  const [state, action, pending] = useActionState(
    createArticleAndGenerate,
    {} as StudioActionState,
  );
  const progress = useUploadProgress(pending);

  useEffect(() => {
    if (state.code === "insufficient_drecs" || (insufficient && state.error)) {
      setRechargeOpen(true);
    }
  }, [state, insufficient, setRechargeOpen]);

  return (
    <>
      <form
        action={(formData) => {
          if (file) formData.set("file", file);
          formData.set("output_kind", kind);
          formData.set("variant_count", String(kind === "image" ? variantCount : 1));
          formData.set("watermark", kind === "image" && watermark ? "1" : "0");
          action(formData);
        }}
        className="space-y-6"
      >
        <UploadDropzone
          file={file}
          onFile={setFile}
          error={state.error}
          progress={pending ? progress : null}
          disabled={pending}
        />
        <div className="space-y-2">
          <Label htmlFor="description">{t("nameOptional")}</Label>
          <Input
            id="description"
            name="description"
            placeholder={t("namePlaceholder")}
            className="h-11 rounded-xl bg-background"
          />
        </div>
        <OutputKindPicker
          value={kind}
          onChange={setKind}
          variantCount={variantCount}
          onVariantCountChange={setVariantCount}
          watermark={watermark}
          onWatermarkChange={requestWatermark}
          disabled={pending}
        />
        {pending ? <UploadProgressBar value={progress} /> : null}
        <div className="space-y-3">
          <Button
            type="submit"
            disabled={pending || !file}
            className="h-12 w-full rounded-xl px-6 sm:w-auto"
            onClick={(event) => {
              if (insufficient) {
                event.preventDefault();
                setRechargeOpen(true);
              }
            }}
          >
            {pending ? t("sending") : t("generate", { cost: drecLabel(cost) })}
          </Button>
          <p className="text-sm text-muted-foreground">
            {insufficient
              ? t("needToLaunch", { cost: drecLabel(cost) })
              : t("remainingAfter", { remaining: drecLabel(remaining) })}
          </p>
        </div>
      </form>
      <LogoRequiredDialog
        open={logoDialogOpen}
        onOpenChange={setLogoDialogOpen}
        onUploaded={onLogoUploaded}
      />
      <RechargeDialog
        open={rechargeOpen}
        onOpenChange={setRechargeOpen}
        articleId={state.articleId}
        needed={cost}
      />
    </>
  );
}
