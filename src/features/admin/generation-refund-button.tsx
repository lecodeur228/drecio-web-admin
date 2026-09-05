"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  adminRefundGeneration,
  type AdminActionState,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function GenerationRefundButton({
  generationId,
  canRefund,
}: {
  generationId: string;
  canRefund: boolean;
}) {
  const t = useTranslations("admin.generations");
  const [state, action, pending] = useActionState(
    adminRefundGeneration,
    {} as AdminActionState,
  );

  if (!canRefund) return null;

  return (
    <form action={action} className="space-y-1">
      <input type="hidden" name="generation_id" value={generationId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="h-8 rounded-lg"
      >
        {pending ? t("refunding") : t("refund")}
      </Button>
      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-foreground">{t("refunded")}</p>
      ) : null}
    </form>
  );
}
