"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

import { patchMe } from "@/lib/api/users";
import { handleApiError } from "@/lib/api/errors";

export type AdminSettingsState = {
  error?: string;
  success?: string;
};

export async function updateAdminProfile(
  _prev: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  const t = await getTranslations("admin.settings");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  try {
    await patchMe({
      display_name: displayName || null,
      phone: phone || null,
    });
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return { success: t("saved") };
  } catch (error) {
    return handleApiError(error, t("saveFailed"));
  }
}
