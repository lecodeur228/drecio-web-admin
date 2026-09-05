"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { generateForArticle, type StudioActionState } from "@/features/articles/actions";
import { RechargeDialog } from "@/features/credits/recharge-dialog";
import { LogoRequiredDialog } from "@/features/generations/logo-required-dialog";
import { OutputKindPicker } from "@/features/generations/output-kind-picker";
import { useGenerateKind } from "@/features/generations/use-generate-kind";
import { Button } from "@/components/ui/button";
import { drecLabel } from "@/lib/pricing";

export function GenerateButton({
  articleId,
  drecs,
  hasLogo = false,
}: {
  articleId: string;
  drecs: number;
  hasLogo?: boolean;
}) {
  const t = useTranslations("article");
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
    generateForArticle,
    {} as StudioActionState,
  );

  useEffect(() => {
    if (state.code === "insufficient_drecs") setRechargeOpen(true);
  }, [state, setRechargeOpen]);

  return (
    <div className="space-y-5">
      <OutputKindPicker
        value={kind}
        onChange={setKind}
        variantCount={variantCount}
        onVariantCountChange={setVariantCount}
        watermark={watermark}
        onWatermarkChange={requestWatermark}
        disabled={pending}
      />
      <form
        action={action}
        onSubmit={(event) => {
          if (insufficient) {
            event.preventDefault();
            setRechargeOpen(true);
          }
        }}
        className="space-y-3"
      >
        <input type="hidden" name="article_id" value={articleId} />
        <input type="hidden" name="output_kind" value={kind} />
        <input type="hidden" name="variant_count" value={kind === "image" ? variantCount : 1} />
        <input type="hidden" name="watermark" value={kind === "image" && watermark ? "1" : "0"} />
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl px-6 sm:w-auto"
        >
          {pending ? t("launching") : t("generate", { cost: drecLabel(cost) })}
        </Button>
        <p className="text-sm text-muted-foreground">
          {insufficient
            ? t("needToLaunch", { cost: drecLabel(cost) })
            : t("remainingAfter", { remaining: drecLabel(remaining) })}
        </p>
      </form>
      {state.error && state.code !== "insufficient_drecs" ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <LogoRequiredDialog
        open={logoDialogOpen}
        onOpenChange={setLogoDialogOpen}
        onUploaded={onLogoUploaded}
      />
      <RechargeDialog
        open={rechargeOpen}
        onOpenChange={setRechargeOpen}
        articleId={articleId}
        needed={cost}
      />
    </div>
  );
}
