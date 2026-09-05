"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { DiamondLoader } from "@/components/brand/diamond";
import { fetchDrecsBalance } from "@/features/credits/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReturnPoller({
  initialBalance,
  previousBalance,
}: {
  initialBalance: number;
  previousBalance: number | null;
}) {
  const t = useTranslations("credits");
  const toasted = useRef(false);
  const { data } = useQuery({
    queryKey: ["drecs-balance"],
    queryFn: fetchDrecsBalance,
    initialData: { drecs_balance: initialBalance },
    refetchInterval: (query) => {
      const current = query.state.data?.drecs_balance ?? initialBalance;
      if (
        previousBalance !== null &&
        current > previousBalance &&
        toasted.current
      ) {
        return false;
      }
      if (previousBalance !== null && current > previousBalance) return false;
      return 2500;
    },
  });

  const balance = data?.drecs_balance ?? initialBalance;
  const confirmed =
    previousBalance !== null ? balance > previousBalance : false;

  useEffect(() => {
    if (confirmed && !toasted.current) {
      toasted.current = true;
      toast.success(t("creditedToast"));
    }
  }, [confirmed, t]);

  if (confirmed) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 text-center">
        <span className="diamond mx-auto block size-4" />
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("returnOkTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("returnOkBody", { balance })}
        </p>
        <Link href="/" className={cn(buttonVariants(), "h-11 rounded-xl")}>
          {t("returnHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
      <DiamondLoader />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("returnPendingTitle")}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("returnPendingBody")}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("returnCurrent", { balance })}
      </p>
    </div>
  );
}
