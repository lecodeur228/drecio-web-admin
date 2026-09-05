"use server";

import { getTranslations } from "next-intl/server";

import { deleteMyLogo, patchMe, uploadMyLogo } from "@/lib/api/users";
import { handleApiError } from "@/lib/api/errors";
import { validateImageFile } from "@/lib/image-upload";
import { revalidateStudioData } from "@/lib/revalidate";

export type SettingsState = {
  error?: string;
  success?: string;
};

export async function updateDisplayName(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = await getTranslations("settings");
  const displayName = String(formData.get("display_name") ?? "").trim();
  try {
    await patchMe({ display_name: displayName || null });
    revalidateStudioData();
    return { success: t("saved") };
  } catch (error) {
    return handleApiError(error, t("saveFailed"));
  }
}

export async function uploadLogoAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = await getTranslations("settings");
  const tUpload = await getTranslations("upload");
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: t("logoFailed") };
  }
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: tUpload(validationError) };
  }
  try {
    await uploadMyLogo(file);
    revalidateStudioData();
    return { success: t("logoSaved") };
  } catch (error) {
    return handleApiError(error, t("logoFailed"));
  }
}

export async function deleteLogoAction(): Promise<SettingsState> {
  const t = await getTranslations("settings");
  try {
    await deleteMyLogo();
    revalidateStudioData();
    return { success: t("logoRemoved") };
  } catch (error) {
    return handleApiError(error, t("logoFailed"));
  }
}
