import Image from "next/image";
import Link from "next/link";

import { logoVariants, type LogoVariant } from "@/lib/assets";
import { cn } from "@/lib/utils";

export function Logo({
  variant = "wordmark",
  href = "/",
  className,
  priority = false,
}: {
  variant?: LogoVariant;
  href?: string | null | false;
  className?: string;
  priority?: boolean;
}) {
  const config = logoVariants[variant];
  const darkVariant =
    variant === "wordmark"
      ? "wordmark-white"
      : variant === "full"
        ? "full-white"
        : null;
  const darkConfig = darkVariant ? logoVariants[darkVariant] : null;

  const image = (
    <>
      <Image
        src={config.src}
        alt="Drecio"
        width={config.width}
        height={config.height}
        priority={priority}
        unoptimized
        className={cn(
          config.className,
          className,
          darkConfig && "dark:hidden",
        )}
      />
      {darkConfig ? (
        <Image
          src={darkConfig.src}
          alt="Drecio"
          width={darkConfig.width}
          height={darkConfig.height}
          priority={priority}
          unoptimized
          className={cn(darkConfig.className, className, "hidden dark:block")}
        />
      ) : null}
    </>
  );

  if (href === null || href === false) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}

export function LogoMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src={logoVariants.icon.src}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={cn("shrink-0", className)}
      aria-hidden
    />
  );
}
