"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { createArticle } from "@/lib/api/articles";
import { requestGeneration } from "@/lib/api/generations";
import { handleApiError } from "@/lib/api/errors";
import { validateImageFile } from "@/lib/image-upload";
import { revalidateStudioData } from "@/lib/revalidate";
import type { OutputKind } from "@/types/api";

export type StudioActionState = {
  error?: string;
  code?: string;
  articleId?: string;
};

function parseOutputKind(value: FormDataEntryValue | null): OutputKind {
  return value === "video" ? "video" : "image";
}

function parseVariantCount(value: FormDataEntryValue | null): number {
  const n = Number.parseInt(String(value ?? "1"), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(7, n));
}

function parseWatermark(value: FormDataEntryValue | null): boolean {
  return value === "1" || value === "true" || value === "on";
}

async function readFile(
  formData: FormData,
): Promise<{ error?: string; file?: File }> {
  const t = await getTranslations("article");
  const tUpload = await getTranslations("upload");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: t("needPhoto") };
  }
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: tUpload(validationError) };
  }
  return { file };
}

export async function createArticleAndGenerate(
  _prev: StudioActionState,
  formData: FormData,
): Promise<StudioActionState> {
  const t = await getTranslations("article");
  const parsed = await readFile(formData);
  if (parsed.error || !parsed.file) {
    return { error: parsed.error };
  }

  const description = String(formData.get("description") ?? "").trim();
  const outputKind = parseOutputKind(formData.get("output_kind"));
  const variantCount = parseVariantCount(formData.get("variant_count"));
  const watermark = parseWatermark(formData.get("watermark"));
  const payload = new FormData();
  payload.set("file", parsed.file);
  if (description) payload.set("description", description);

  let articleId: string;
  try {
    const article = await createArticle(payload);
    articleId = article.id;
    revalidateStudioData();
  } catch (error) {
    return handleApiError(error, t("uploadFailed"));
  }

  try {
    const generation = await requestGeneration(
      articleId,
      outputKind,
      variantCount,
      watermark,
    );
    revalidateStudioData();
    redirect(`/generations/${generation.id}`);
  } catch (error) {
    return { ...(await handleApiError(error)), articleId };
  }
}

export async function generateForArticle(
  _prev: StudioActionState,
  formData: FormData,
): Promise<StudioActionState> {
  const t = await getTranslations("article");
  const articleId = String(formData.get("article_id") ?? "");
  const outputKind = parseOutputKind(formData.get("output_kind"));
  const variantCount = parseVariantCount(formData.get("variant_count"));
  const watermark = parseWatermark(formData.get("watermark"));
  if (!articleId) {
    return { error: t("notFound") };
  }
  try {
    const generation = await requestGeneration(
      articleId,
      outputKind,
      variantCount,
      watermark,
    );
    revalidateStudioData();
    redirect(`/generations/${generation.id}`);
  } catch (error) {
    return { ...(await handleApiError(error)), articleId };
  }
}
