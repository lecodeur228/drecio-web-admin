"use server";

import { revalidatePath } from "next/cache";

import {
  draftPlacementAiTexts,
  patchAdminSystemConfig,
  patchAdminUserRole,
  refundAdminGeneration,
  getAdminSystemConfig,
} from "@/lib/api/admin";
import { handleApiError } from "@/lib/api/errors";
import type {
  AdminSystemConfigPatch,
  PlacementAiTextsDraft,
  PlacementZoneConfig,
} from "@/types/admin";
import type { UserRole } from "@/types/api";

export type AdminActionState = {
  error?: string;
  success?: string;
};

export async function adminChangeRole(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;
  if (!userId || (role !== "admin" && role !== "seller")) {
    return { error: "Invalid role" };
  }
  try {
    await patchAdminUserRole(userId, role);
    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    return { success: "ok" };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function adminRefundGeneration(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const generationId = String(formData.get("generation_id") ?? "");
  if (!generationId) return { error: "Missing generation" };
  try {
    const result = await refundAdminGeneration(generationId);
    revalidatePath("/generations");
    revalidatePath("/");
    if (!result.refunded) {
      return { error: result.message };
    }
    return { success: "ok" };
  } catch (error) {
    return handleApiError(error);
  }
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

async function savePatch(
  patch: AdminSystemConfigPatch,
): Promise<AdminActionState> {
  try {
    await patchAdminSystemConfig(patch);
    revalidatePath("/system", "layout");
    return { success: "ok" };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function adminSaveModels(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return savePatch({
    image_model: str(formData, "image_model"),
    image_model_fallback: str(formData, "image_model_fallback"),
    video_model: str(formData, "video_model"),
    video_model_fallback: str(formData, "video_model_fallback"),
    video_model_lite: str(formData, "video_model_lite"),
  });
}

export async function adminSaveFeatures(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return savePatch({
    enable_image_generation:
      formData.get("enable_image_generation") === "on" ||
      formData.get("enable_image_generation") === "true",
    enable_video_generation:
      formData.get("enable_video_generation") === "on" ||
      formData.get("enable_video_generation") === "true",
  });
}

export async function adminSavePrompts(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const framingKeys = ["shoes", "top", "bottom", "dress", "accessory", "unknown"] as const;
  const framing: Record<string, string> = {};
  for (const key of framingKeys) {
    framing[key] = str(formData, `prompt_framing_${key}`);
  }
  return savePatch({
    prompt_mannequin: str(formData, "prompt_mannequin"),
    prompt_framing: framing,
    prompt_video_base: str(formData, "prompt_video_base"),
    prompt_video_shoes_suffix: str(formData, "prompt_video_shoes_suffix"),
    prompt_video_default_suffix: str(formData, "prompt_video_default_suffix"),
  });
}

export async function adminSavePlacements(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const raw = String(formData.get("placement_zones_json") ?? "");
  try {
    const parsed = JSON.parse(raw) as PlacementZoneConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { error: "Ajoute au moins une zone de placement." };
    }
    for (const zone of parsed) {
      if (!zone.id?.trim() || !zone.label_fr?.trim() || !zone.label_en?.trim()) {
        return { error: "Chaque zone doit avoir un id et des libellés FR/EN." };
      }
      if (!zone.tryon_framing?.trim()) {
        return { error: `La zone « ${zone.id} » doit avoir un cadrage try-on.` };
      }
    }
    return savePatch({ placement_zones: parsed });
  } catch {
    return { error: "Payload placements invalide." };
  }
}

export async function adminResetPlacements(
  _prev: AdminActionState,
): Promise<AdminActionState> {
  try {
    const config = await getAdminSystemConfig();
    const defaults = config.defaults?.placement_zones;
    if (!Array.isArray(defaults) || defaults.length === 0) {
      return { error: "No default placement zones available" };
    }
    return savePatch({
      placement_zones: defaults as PlacementZoneConfig[],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function adminDraftPlacementAiTexts(input: {
  admin_intent: string;
  label_fr?: string;
  category?: string;
  zone_id?: string;
}): Promise<{ data?: PlacementAiTextsDraft; error?: string }> {
  const intent = input.admin_intent?.trim() ?? "";
  if (intent.length < 3) {
    return { error: "Décris le cadrage en quelques mots (ex. coupe à la hanche)." };
  }
  try {
    const data = await draftPlacementAiTexts({
      admin_intent: intent,
      label_fr: input.label_fr,
      category: input.category,
      zone_id: input.zone_id,
    });
    return { data };
  } catch (error) {
    const handled = await handleApiError(error);
    return { error: handled.error ?? "Impossible de générer les textes IA." };
  }
}
