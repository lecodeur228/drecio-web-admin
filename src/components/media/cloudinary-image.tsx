"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function CloudinaryImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 40vw",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="flex size-full items-center justify-center bg-muted">
        <span className="diamond size-4" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
