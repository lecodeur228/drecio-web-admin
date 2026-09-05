"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import type { GenerationStatus } from "@/types/api";

export function StatusBadge({ status }: { status: GenerationStatus }) {
  const t = useTranslations("status");
  const variant =
    status === "completed"
      ? "default"
      : status === "failed"
        ? "destructive"
        : "secondary";

  return <Badge variant={variant}>{t(status)}</Badge>;
}
