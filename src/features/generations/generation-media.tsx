import Image from "next/image";

import { CloudinaryImage } from "@/components/media/cloudinary-image";
import { cn } from "@/lib/utils";
import type { OutputKind } from "@/types/api";

export function GenerationMedia({
  src,
  kind,
  alt,
  className,
  mode = "cover",
  autoPlay = false,
  controls = false,
}: {
  src: string | null;
  kind: OutputKind;
  alt: string;
  className?: string;
  mode?: "cover" | "contain";
  autoPlay?: boolean;
  controls?: boolean;
}) {
  if (!src) {
    return (
      <div className="flex size-full items-center justify-center bg-muted">
        <Image
          src="/logo-icon.png"
          alt=""
          width={40}
          height={40}
          unoptimized
          className="opacity-20"
          aria-hidden
        />
      </div>
    );
  }

  if (kind === "video") {
    return (
      <video
        src={src}
        muted={!controls}
        playsInline
        loop={autoPlay}
        autoPlay={autoPlay}
        controls={controls}
        className={cn(
          "absolute inset-0 size-full",
          mode === "contain" ? "bg-black object-contain" : "object-cover",
          className,
        )}
      />
    );
  }

  return <CloudinaryImage src={src} alt={alt} className={className} />;
}
