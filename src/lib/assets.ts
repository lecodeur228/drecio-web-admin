export const assets = {
  logo: {
    icon: "/logo-icon.png",
    wordmarkBlack: "/brand/logo_black.png",
    wordmarkWhite: "/brand/logo_white.png",
    fullBlack: "/brand/logo_complet_black.png",
    fullWhite: "/brand/logo_complet_white.png",
  },
} as const;

export type LogoVariant = "icon" | "wordmark" | "wordmark-white" | "full" | "full-white";

export const logoVariants: Record<
  LogoVariant,
  { src: string; width: number; height: number; className: string }
> = {
  icon: {
    src: assets.logo.icon,
    width: 32,
    height: 32,
    className: "h-8 w-8",
  },
  wordmark: {
    src: assets.logo.wordmarkBlack,
    width: 120,
    height: 36,
    className: "h-7 w-auto",
  },
  "wordmark-white": {
    src: assets.logo.wordmarkWhite,
    width: 120,
    height: 36,
    className: "h-7 w-auto",
  },
  full: {
    src: assets.logo.fullBlack,
    width: 200,
    height: 200,
    className: "h-40 w-auto",
  },
  "full-white": {
    src: assets.logo.fullWhite,
    width: 200,
    height: 200,
    className: "h-40 w-auto",
  },
};
