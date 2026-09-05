const PLACEHOLDER_PATTERNS = [
  /^YOUR_/i,
  /^your_/i,
  /^xxx+$/i,
  /^changeme/i,
  /^placeholder/i,
  /^replace_me/i,
];

function isPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.includes("YOUR_PROJECT")) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return !isPlaceholder(url) && !isPlaceholder(key);
}

/** UI/design work without Supabase or FastAPI. Auto-enabled when Supabase is missing. */
export function isDesignMode(): boolean {
  if (process.env.NEXT_PUBLIC_DESIGN_MODE === "true") return true;
  return !isSupabaseConfigured();
}
