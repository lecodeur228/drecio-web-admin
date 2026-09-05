const ALLOWED_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "storage.googleapis.com",
]);

export function isAllowedMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function mediaFilename(kind: "image" | "video", id: string): string {
  const safe = id.replaceAll("-", "").slice(0, 8);
  return kind === "video" ? `drecio-${safe}.mp4` : `drecio-${safe}.png`;
}

export function downloadProxyPath(url: string, filename: string): string {
  const params = new URLSearchParams({ url, filename });
  return `/api/media/download?${params.toString()}`;
}
