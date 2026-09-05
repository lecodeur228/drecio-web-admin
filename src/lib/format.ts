import type { Article } from "@/types/api";

function intlLocale(locale: string): string {
  return locale.startsWith("en") ? "en-US" : "fr-FR";
}

export function formatFcfa(amount: number, locale = "fr"): string {
  return `${new Intl.NumberFormat(intlLocale(locale)).format(amount)} F`;
}

export function articleLabel(
  article: Pick<Article, "title" | "description">,
  unnamed = "Sans nom",
): string {
  return article.title?.trim() || article.description?.trim() || unnamed;
}

export function shortRef(id: string): string {
  return `#${id.replaceAll("-", "").slice(0, 4)}`;
}

export function formatStudioDate(iso: string | null, locale = "fr"): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}

export function formatStudioDateTime(iso: string | null, locale = "fr"): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function articleTitles(
  articles: Pick<Article, "id" | "title" | "description">[],
  unnamed = "Sans nom",
): Record<string, string> {
  return Object.fromEntries(
    articles.map((article) => [article.id, articleLabel(article, unnamed)]),
  );
}

const API_ERROR_CODES = new Set([
  "insufficient_drecs",
  "unauthorized",
  "not_found",
  "conflict",
  "payment_error",
  "ai_provider_error",
  "backend_unavailable",
  "database_unavailable",
  "design_mode",
]);

export function friendlyApiMessage(
  code: string,
  fallback: string,
  t?: (key: string) => string,
): string {
  if (t && API_ERROR_CODES.has(code)) {
    return t(code);
  }
  return fallback;
}

type ErrorCopy = (key: "aiGeneric" | "aiKey" | "aiImage" | "aiModel") => string;

export function generationFailureMessage(
  error: string | null,
  t: ErrorCopy,
): string {
  if (!error) return t("aiGeneric");
  const lower = error.toLowerCase();
  if (
    lower.includes("invalid_api_key") ||
    lower.includes("rd_sk_") ||
    lower.includes("rodiumai error (401)")
  ) {
    return t("aiKey");
  }
  if (lower.includes("failed to download article image")) {
    return t("aiImage");
  }
  if (lower.includes("model_not_found") || lower.includes("not found")) {
    return t("aiModel");
  }
  return t("aiGeneric");
}
