"use client";

import { useEffect, useState } from "react";

import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

export function useUploadProgress(active: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue((current) => (current > 0 ? 100 : 0));
      const reset = window.setTimeout(() => setValue(0), 400);
      return () => window.clearTimeout(reset);
    }

    setValue(3);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started;
      setValue((current) => {
        if (current >= 92) return current;
        const target = Math.min(92, 8 + elapsed / 45);
        return Math.min(92, current + (target - current) * 0.18 + 0.35);
      });
    }, 80);

    return () => window.clearInterval(tick);
  }, [active]);

  return value;
}

function labelFor(
  value: number,
  t: (key: "sending" | "saving" | "starting" | "done") => string,
): string {
  if (value < 35) return t("sending");
  if (value < 70) return t("saving");
  if (value < 100) return t("starting");
  return t("done");
}

export function UploadProgressBar({ value }: { value: number }) {
  const t = useTranslations("upload");
  const rounded = Math.round(value);

  return (
    <Progress value={rounded} className="gap-2">
      <span className="text-sm text-muted-foreground">{labelFor(value, t)}</span>
      <span className="ml-auto text-sm tabular-nums text-muted-foreground">
        {rounded}%
      </span>
    </Progress>
  );
}
