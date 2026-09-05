"use client";

import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { CloudinaryImage } from "@/components/media/cloudinary-image";
import { GenerationMedia } from "@/features/generations/generation-media";
import type { Generation } from "@/types/api";

export function GenerationResultCard({
  originalUrl,
  generation,
  originalAlt,
  resultAlt,
}: {
  originalUrl: string;
  generation: Generation;
  originalAlt?: string;
  resultAlt?: string;
}) {
  const t = useTranslations("generation");
  const resultUrl = generation.result_url;
  if (!resultUrl) return null;

  const original = originalAlt ?? t("originalAlt");
  const result = resultAlt ?? t("resultAlt");
  const isVideo = generation.output_kind === "video";
  const urls =
    !isVideo && generation.result_urls && generation.result_urls.length > 0
      ? generation.result_urls
      : [resultUrl];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-5">
        <figure className="space-y-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/8">
            {originalUrl ? (
              <CloudinaryImage src={originalUrl} alt={original} />
            ) : null}
          </div>
          <figcaption className="text-center text-sm text-muted-foreground">
            {t("before")}
          </figcaption>
        </figure>

        <ArrowDownIcon
          className="mx-auto size-6 text-muted-foreground sm:hidden"
          aria-hidden
        />
        <ArrowRightIcon
          className="hidden size-6 text-muted-foreground sm:block"
          aria-hidden
        />

        <figure className="space-y-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/8">
            <GenerationMedia
              src={urls[0]}
              kind={generation.output_kind}
              alt={result}
              mode="contain"
              controls={isVideo}
            />
          </div>
          <figcaption className="text-center text-sm text-muted-foreground">
            {t("after")}
          </figcaption>
        </figure>
      </div>

      {!isVideo && urls.length > 1 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("variantsTitle", { count: urls.length })}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {urls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/8"
              >
                <GenerationMedia
                  src={url}
                  kind="image"
                  alt={t("variantAlt", { index: index + 1 })}
                  mode="contain"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
