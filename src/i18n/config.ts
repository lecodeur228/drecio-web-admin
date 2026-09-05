export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const LOCALE_COOKIE = "drecio_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;
  const preferred = header.split(",")[0]?.split(";")[0]?.trim().toLowerCase();
  if (preferred?.startsWith("en")) return "en";
  return defaultLocale;
}
