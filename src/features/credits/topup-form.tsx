"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { topupPack } from "@/features/credits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatFcfa } from "@/lib/format";
import {
  DREC_PRICE_FCFA,
  MIN_TOPUP_FCFA,
  TOPUP_PRESETS_FCFA,
  drecLabel,
  drecsToFcfa,
  fcfaToDrecs,
  rateHintValues,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function TopupForm() {
  const t = useTranslations("credits");
  const tPricing = useTranslations("pricing");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [fcfaInput, setFcfaInput] = useState(String(MIN_TOPUP_FCFA));

  const parsed = Number.parseInt(fcfaInput, 10);
  const validAmount =
    Number.isInteger(parsed) &&
    parsed >= MIN_TOPUP_FCFA &&
    parsed % DREC_PRICE_FCFA === 0;
  const drecs = validAmount ? fcfaToDrecs(parsed) : 0;
  const rateHint = tPricing("rateHint", rateHintValues());

  const hint = useMemo(() => {
    if (!fcfaInput.trim()) return rateHint;
    if (!Number.isInteger(parsed) || parsed < 1) {
      return t("hintFrancs");
    }
    if (parsed < MIN_TOPUP_FCFA) {
      return t("hintMin", { amount: formatFcfa(MIN_TOPUP_FCFA, locale) });
    }
    if (parsed % DREC_PRICE_FCFA !== 0) {
      return t("hintMultiple", { price: DREC_PRICE_FCFA });
    }
    return t("hintReceive", { drecs: drecLabel(drecs) });
  }, [drecs, fcfaInput, locale, parsed, rateHint, t]);

  function pay(fcfa: number) {
    const nextDrecs = fcfaToDrecs(fcfa);
    startTransition(async () => {
      const result = await topupPack(nextDrecs);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{rateHint}</p>
      <div className="flex flex-wrap gap-2">
        {TOPUP_PRESETS_FCFA.map((amount) => (
          <button
            key={amount}
            type="button"
            disabled={pending}
            onClick={() => setFcfaInput(String(amount))}
            className={cn(
              "h-10 rounded-xl px-4 text-sm ring-1 ring-foreground/10 transition-colors",
              parsed === amount
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card hover:bg-muted",
            )}
          >
            {formatFcfa(amount, locale)}
          </button>
        ))}
      </div>
      <form
        className="space-y-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/8"
        onSubmit={(event) => {
          event.preventDefault();
          if (!validAmount) {
            toast.error(hint);
            return;
          }
          pay(parsed);
        }}
      >
        <Label htmlFor="topup-fcfa">{t("amountLabel")}</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="topup-fcfa"
            inputMode="numeric"
            min={MIN_TOPUP_FCFA}
            step={DREC_PRICE_FCFA}
            placeholder={String(MIN_TOPUP_FCFA)}
            value={fcfaInput}
            onChange={(event) => setFcfaInput(event.target.value)}
            className="h-11 rounded-xl bg-background"
          />
          <Button type="submit" disabled={pending || !validAmount} className="h-11 rounded-xl">
            {pending
              ? t("redirecting")
              : validAmount
                ? t("payAmount", { amount: formatFcfa(drecsToFcfa(drecs), locale) })
                : t("pay")}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </form>
    </div>
  );
}
