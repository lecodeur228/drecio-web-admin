import "server-only";

import { isDesignMode } from "@/lib/supabase/config";
import { getAccessToken } from "@/lib/supabase/server";

import { ApiError, toApiError } from "./errors";
import { mockApiResponse } from "./mock";

function fastapiUrl(): string {
  const url = process.env.FASTAPI_URL;
  if (!url) {
    throw new ApiError(
      500,
      "config_error",
      "FASTAPI_URL n’est pas configurée côté serveur.",
    );
  }
  return url.replace(/\/$/, "");
}

type ApiOptions = RequestInit;

export async function api<T>(path: string, init: ApiOptions = {}): Promise<T> {
  if (isDesignMode()) {
    return mockApiResponse<T>(path, init);
  }

  const headers = new Headers(init.headers);

  const token = await getAccessToken();
  if (!token) {
    throw new ApiError(401, "unauthorized", "Session expirée.");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const isFormData = init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${fastapiUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(30_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(
        504,
        "backend_timeout",
        "Le backend FastAPI ne répond pas (timeout). Vérifie qu’il tourne et n’est pas bloqué.",
      );
    }
    const cause = error instanceof Error ? error.cause : undefined;
    const code =
      cause &&
      typeof cause === "object" &&
      "code" in cause &&
      typeof cause.code === "string"
        ? cause.code
        : undefined;

    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      throw new ApiError(
        503,
        "backend_unavailable",
        "Le backend FastAPI est injoignable. Lance-le avec : cd drecio-fastapi && python3 -m uvicorn app.main:app --reload --port 8000",
      );
    }

    throw new ApiError(
      503,
      "backend_unavailable",
      "Impossible de joindre le backend FastAPI. Vérifie que le serveur tourne sur le port 8000.",
    );
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
