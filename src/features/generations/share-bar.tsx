"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, DownloadIcon, Share2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadProxyPath, mediaFilename } from "@/lib/media";
import { canNativeShare, shareTargets } from "@/lib/share";
import type { OutputKind } from "@/types/api";

function watermarkDownloadPath(
  generationId: string,
  filename: string,
  url?: string,
) {
  const params = new URLSearchParams({ filename });
  if (url) params.set("url", url);
  return `/api/generations/${generationId}/download?${params.toString()}`;
}

export function ShareBar({
  url,
  kind,
  title,
  generationId,
  watermarkEnabled = false,
}: {
  url: string;
  kind: OutputKind;
  title: string;
  generationId: string;
  watermarkEnabled?: boolean;
}) {
  const t = useTranslations("share");
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const filename = mediaFilename(kind, generationId);
  const downloadHref =
    watermarkEnabled && kind === "image"
      ? watermarkDownloadPath(generationId, filename, url)
      : downloadProxyPath(url, filename);
  const message =
    kind === "video"
      ? t("messageVideo", { title })
      : t("messageImage", { title });
  const targets = shareTargets(url, message);

  async function download() {
    setBusy("download");
    try {
      const response = await fetch(downloadHref);
      if (!response.ok) throw new Error("download");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error(t("downloadFailed"));
    } finally {
      setBusy(null);
    }
  }

  async function nativeShare() {
    setBusy("share");
    try {
      const payload: ShareData = { title: "Drecio", text: message, url };
      if (navigator.canShare) {
        const response = await fetch(downloadHref);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], filename, {
            type: blob.type || (kind === "video" ? "video/mp4" : "image/png"),
          });
          if (navigator.canShare({ files: [file] })) {
            payload.files = [file];
          }
        }
      }
      await navigator.share(payload);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(t("shareFailed"));
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-xl gap-2"
        disabled={busy !== null}
        onClick={() => void download()}
      >
        <DownloadIcon className="size-4" />
        {busy === "download" ? t("downloading") : t("download")}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="default" className="h-10 rounded-xl gap-2" />
          }
          disabled={busy !== null}
        >
          <Share2Icon className="size-4" />
          {t("share")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          {canNativeShare() ? (
            <>
              <DropdownMenuItem
                onClick={() => void nativeShare()}
                disabled={busy !== null}
              >
                <Share2Icon />
                {t("nativeApps")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {targets.map((target) => (
            <DropdownMenuItem
              key={target.id}
              render={
                <a href={target.href} target="_blank" rel="noopener noreferrer" />
              }
            >
              {target.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void copyLink()}>
            <CopyIcon />
            {t("copyLink")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
