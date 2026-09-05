"use server";

import { getTranslations } from "next-intl/server";

import { uploadMyLogo } from "@/lib/api/users";
import { validateImageFile } from "@/lib/image-upload";
import { isDesignMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
  redirectTo?: string;
};

function required(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const t = await getTranslations("auth");
  const email = required(formData, "email");
  const password = required(formData, "password");
  if (!email || !password) {
    return { error: t("emailPasswordRequired") };
  }

  if (isDesignMode()) {
    return { redirectTo: "/" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: t("supabaseMissing") };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: t("invalidCredentials") };
    }
  } catch {
    return { error: t("supabaseMissing") };
  }

  return { redirectTo: "/" };
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const t = await getTranslations("auth");
  const email = required(formData, "email");
  const password = required(formData, "password");

  if (!email || !password) {
    return { error: t("emailPasswordRequiredSignup") };
  }
  if (password.length < 8) {
    return { error: t("passwordMin") };
  }

  if (isDesignMode()) {
    return { redirectTo: "/" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: t("supabaseMissing") };
  }

  let data;
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
    });
    if (result.error) {
      return { error: result.error.message };
    }
    data = result.data;
  } catch {
    return { error: t("supabaseMissing") };
  }

  if (!data.session) {
    return { message: t("confirmEmail") };
  }

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const validationError = validateImageFile(logo);
    if (!validationError) {
      try {
        await uploadMyLogo(logo);
      } catch {
        return { redirectTo: "/settings?logo=pending" };
      }
    }
  }

  return { redirectTo: "/" };
}
