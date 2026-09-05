"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { drecLabel } from "@/lib/pricing";

export function RechargeDialog({
  open,
  onOpenChange,
  articleId,
  needed = 1,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId?: string;
  needed?: number;
}) {
  const t = useTranslations("credits");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("rechargeTitle", { needed: drecLabel(needed) })}</DialogTitle>
          <DialogDescription>{t("rechargeBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            {tCommon("later")}
          </Button>
          <Link href="/credits" className={cn(buttonVariants(), "rounded-xl")}>
            {tNav("addCredits")}
          </Link>
        </DialogFooter>
        {articleId ? (
          <p className="text-xs text-muted-foreground">
            {t("rechargeSaved")}{" "}
            <Link href={`/articles/${articleId}`} className="underline">
              {t("articleSheet")}
            </Link>
            .
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
