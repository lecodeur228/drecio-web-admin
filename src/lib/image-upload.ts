export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

export type ImageFileError = "empty" | "tooLarge" | "unsupported";

export function validateImageFile(file: File): ImageFileError | null {
  if (file.size === 0) {
    return "empty";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "tooLarge";
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (file.type && ALLOWED_MIME.has(file.type)) {
    return null;
  }
  if (ext && ALLOWED_EXT.has(ext)) {
    return null;
  }

  return "unsupported";
}
