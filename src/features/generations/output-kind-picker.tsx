"use client";

import { useTranslations } from "next-intl";

import { costForGeneration, drecLabel } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { OutputKind } from "@/types/api";

export const VARIANT_COUNTS = [1, 2, 3, 4, 5, 6, 7] as const;
export type VariantCount = (typeof VARIANT_COUNTS)[number];

export function OutputKindPicker({
  value,
  onChange,
  variantCount = 1,
  onVariantCountChange,
  watermark = false,
  onWatermarkChange,
  disabled,
}: {
  value: OutputKind;
  onChange: (kind: OutputKind) => void;
  variantCount?: VariantCount;
  onVariantCountChange?: (count: VariantCount) => void;
  watermark?: boolean;
  onWatermarkChange?: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("generation");
  const options = [
    { id: "image" as const, title: t("photo"), hint: t("imageHint") },
    { id: "video" as const, title: t("video"), hint: t("videoHint") },
  ];

  return (
    <div className="space-y-4">
      <fieldset className="space-y-3" disabled={disabled}>
        <legend className="text-sm font-medium">{t("wantWhat")}</legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-3">
          {options.map((option) => {
            const selected = value === option.id;
            const cost =
              option.id === "image"
                ? costForGeneration("image", variantCount)
                : costForGeneration("video");
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option.id)}
                className={
                  selected
                    ? "rounded-2xl bg-card px-4 py-4 text-left ring-2 ring-primary"
                    : "rounded-2xl bg-card px-4 py-4 text-left ring-1 ring-foreground/8"
                }
              >
                <p className="font-medium">{option.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{option.hint}</p>
                <p className="mt-2 text-sm font-medium">{drecLabel(cost)}</p>
              </button>
            );
          })}
        </div>
      </fieldset>

      {value === "image" && onVariantCountChange ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">{t("variantCountLabel")}</p>
            <p className="text-sm text-muted-foreground">{t("variantCountHint")}</p>
          </div>
          <div
            role="radiogroup"
            aria-label={t("variantCountLabel")}
            className="grid grid-cols-7 gap-2"
          >
            {VARIANT_COUNTS.map((count) => {
              const selected = variantCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => onVariantCountChange(count)}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground ring-1 ring-foreground/10 hover:bg-muted disabled:opacity-50",
                  )}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {value === "image" && onWatermarkChange ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-input"
            checked={watermark}
            disabled={disabled}
            onChange={(event) => onWatermarkChange(event.target.checked)}
          />
          <span className="space-y-1">
            <span className="block text-sm font-medium">{t("watermarkLabel")}</span>
            <span className="block text-sm text-muted-foreground">
              {t("watermarkHint")}
            </span>
          </span>
        </label>
      ) : null}
    </div>
  );
}
