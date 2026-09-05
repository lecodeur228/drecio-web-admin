"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

import { MOTION_DURATION, useMotionEnabled } from "@/components/motion/presence";
import {
  IMAGE_ACCEPT,
  validateImageFile,
} from "@/lib/image-upload";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  file,
  onFile,
  error,
  progress = null,
  disabled = false,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  error?: string;
  progress?: number | null;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const enabled = useMotionEnabled();
  const t = useTranslations("upload");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function accept(next: File | undefined) {
    if (!next) return;
    const validationError = validateImageFile(next);
    if (validationError) {
      setLocalError(t(validationError));
      onFile(null);
      return;
    }
    setLocalError(null);
    onFile(next);
  }

  const displayError = localError ?? error;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t("aria")}
      onClick={() => {
        if (disabled) return;
        inputRef.current?.click();
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          setDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth.current = 0;
        setDragging(false);
        accept(event.dataTransfer.files[0]);
      }}
      className={cn(
        "blur-panel flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 px-6 py-10 text-center transition-[box-shadow,background-color] duration-200",
        disabled && "pointer-events-none",
        dragging && "bg-accent ring-2 ring-primary ring-offset-2 ring-offset-background",
        displayError && "ring-2 ring-destructive",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          accept(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={enabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={enabled ? { opacity: 0 } : undefined}
            transition={{ duration: MOTION_DURATION }}
            className="blur-panel-content flex w-full flex-col items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={t("previewAlt")}
              className="max-h-72 w-auto rounded-xl object-contain"
            />
            {progress != null ? (
              <div className="w-full max-w-xs space-y-1.5">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
                    style={{ width: `${Math.round(progress)}%` }}
                  />
                </div>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {Math.round(progress)}%
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("change")}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={enabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            className="blur-panel-content flex flex-col items-center gap-4"
          >
            <ImageIcon className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-base font-medium">{t("drop")}</p>
              <p className="text-sm text-muted-foreground">{t("formats")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {displayError ? (
        <motion.p
          key={displayError}
          initial={enabled ? { x: 0 } : false}
          animate={enabled ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
          transition={{ duration: 0.28 }}
          className="blur-panel-content text-sm text-destructive"
        >
          {displayError}
        </motion.p>
      ) : null}
    </div>
  );
}
