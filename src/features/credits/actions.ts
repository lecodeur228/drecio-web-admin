"use server";

import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { startTopup } from "@/lib/api/credits";
import { getMyDrecs } from "@/lib/api/users";
import { handleApiError } from "@/lib/api/errors";
import { formatFcfa } from "@/lib/format";
import { DRECS_BEFORE_COOKIE } from "@/features/credits/constants";
import { MIN_TOPUP_DRECS, drecLabel, drecsToFcfa } from "@/lib/pricing";

export type TopupState = {
  error?: string;
};

export async function topupPack(drecs: number): Promise<TopupState> {
  const t = await getTranslations("credits");
  if (!Number.isInteger(drecs) || drecs < MIN_TOPUP_DRECS) {
    return {
      error: t("minTopup", {
        amount: formatFcfa(drecsToFcfa(MIN_TOPUP_DRECS)),
        drecs: drecLabel(MIN_TOPUP_DRECS),
      }),
    };
  }

  try {
    const balance = await getMyDrecs();
    const cookieStore = await cookies();
    cookieStore.set(DRECS_BEFORE_COOKIE, String(balance.drecs_balance), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30,
    });
    const session = await startTopup(drecs);
    redirect(session.checkout_url);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchDrecsBalance() {
  return getMyDrecs();
}
