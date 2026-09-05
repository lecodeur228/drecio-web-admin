"use client";

import { useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { uploadLogoAction } from "@/features/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IMAGE_ACCEPT } from "@/lib/image-upload";

export function LogoRequiredDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}) {
  const t = useTranslations("generation");
  const tSettings = useTranslations("settings");
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("watermarkDialogTitle")}</DialogTitle>
          <DialogDescription>{t("watermarkDialogBody")}</DialogDescription>
        </DialogHeader>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.set("logo", file);
            startTransition(async () => {
              const result = await uploadLogoAction({}, form);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success(result.success ?? tSettings("logoSaved"));
              onUploaded();
            });
          }}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {t("watermarkDialogCancel")}
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
          >
            {pending ? tSettings("logoUploading") : t("watermarkDialogUpload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
