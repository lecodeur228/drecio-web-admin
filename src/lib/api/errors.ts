import { getTranslations } from "next-intl/server";

import { friendlyApiMessage } from "@/lib/format";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  let code = "app_error";
  let detail = response.statusText || "An error occurred.";
  try {
    const body = (await response.json()) as { code?: string; detail?: string };
    if (body.code) code = body.code;
    if (body.detail) detail = body.detail;
  } catch {
    // keep defaults
  }
  return new ApiError(response.status, code, detail);
}

/**
 * Re-throw non-API errors; for ApiError, return a friendly message + code.
 */
export async function handleApiError(
  error: unknown,
  fallback?: string,
): Promise<{ error: string; code?: string }> {
  if (error instanceof ApiError) {
    const t = await getTranslations("errors");
    return {
      error: friendlyApiMessage(
        error.code,
        fallback ?? error.message,
        (key) => t(key as "generic"),
      ),
      code: error.code,
    };
  }
  throw error;
}
