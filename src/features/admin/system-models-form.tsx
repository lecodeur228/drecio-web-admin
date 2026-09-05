"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  adminSaveModels,
  type AdminActionState,
} from "@/features/admin/actions";
import { ModelSearchSelect } from "@/features/admin/model-search-select";
import { Button } from "@/components/ui/button";
import type { AdminSystemConfig, RodiumModelsCatalogue } from "@/types/admin";

function withCurrent(
  options: RodiumModelsCatalogue["models"],
  current: string,
): RodiumModelsCatalogue["models"] {
  if (!current) return options;
  if (options.some((item) => item.id === current)) return options;
  return [{ id: current, owned_by: null, kind: "other" }, ...options];
}

export function SystemModelsForm({
  config,
  catalogue,
  catalogueError,
}: {
  config: AdminSystemConfig;
  catalogue: RodiumModelsCatalogue | null;
  catalogueError?: string;
}) {
  const t = useTranslations("admin.system");
  const [state, action, pending] = useActionState(
    adminSaveModels,
    {} as AdminActionState,
  );

  const imageOptions = withCurrent(
    catalogue?.image_models?.length
      ? catalogue.image_models
      : (catalogue?.models ?? []),
    config.image_model,
  );
  const imageFallbackOptions = withCurrent(
    catalogue?.image_models?.length
      ? catalogue.image_models
      : (catalogue?.models ?? []),
    config.image_model_fallback,
  );
  const videoOptions = withCurrent(
    catalogue?.video_models?.length
      ? catalogue.video_models
      : (catalogue?.models ?? []),
    config.video_model,
  );
  const videoFallbackOptions = withCurrent(
    catalogue?.video_models?.length
      ? catalogue.video_models
      : (catalogue?.models ?? []),
    config.video_model_fallback,
  );
  const videoLiteOptions = withCurrent(
    catalogue?.video_models?.length
      ? catalogue.video_models
      : (catalogue?.models ?? []),
    config.video_model_lite,
  );

  return (
    <form action={action} className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("modelsHint")}</p>
      {catalogueError ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {catalogueError}
        </p>
      ) : null}
      {catalogue ? (
        <p className="text-xs text-muted-foreground">
          {t("modelsLoaded", {
            total: catalogue.models.length,
            image: catalogue.image_models.length,
            video: catalogue.video_models.length,
          })}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <h3 className="text-sm font-medium">{t("modelsPhotoGroup")}</h3>
          <ModelSearchSelect
            id="image_model"
            name="image_model"
            label={t("imageModel")}
            value={config.image_model}
            options={imageOptions}
          />
          <ModelSearchSelect
            id="image_model_fallback"
            name="image_model_fallback"
            label={t("imageModelFallback")}
            value={config.image_model_fallback}
            options={imageFallbackOptions}
          />
        </div>

        <div className="space-y-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <h3 className="text-sm font-medium">{t("modelsVideoGroup")}</h3>
          <ModelSearchSelect
            id="video_model"
            name="video_model"
            label={t("videoModel")}
            value={config.video_model}
            options={videoOptions}
          />
          <ModelSearchSelect
            id="video_model_fallback"
            name="video_model_fallback"
            label={t("videoModelFallback")}
            value={config.video_model_fallback}
            options={videoFallbackOptions}
          />
          <ModelSearchSelect
            id="video_model_lite"
            name="video_model_lite"
            label={t("videoModelLite")}
            value={config.video_model_lite}
            options={videoLiteOptions}
          />
        </div>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-foreground">{t("saved")}</p> : null}

      <Button type="submit" disabled={pending} className="h-11 rounded-xl">
        {pending ? t("saving") : t("saveModels")}
      </Button>
    </form>
  );
}
