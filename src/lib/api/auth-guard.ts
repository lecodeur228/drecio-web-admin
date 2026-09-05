import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/errors";

export function redirectIfUnauthorized(error: unknown): never {
  if (error instanceof ApiError && error.status === 401) {
    redirect("/login");
  }
  throw error;
}
