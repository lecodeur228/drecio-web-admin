import "server-only";

import { cache } from "react";

import type { DrecsBalance, User, UserPatch } from "@/types/api";

import { api } from "./client";
import { endpoints } from "./endpoints";

export const getMe = cache(async function getMe(): Promise<User> {
  return api<User>(endpoints.users.me);
});

export const getMyDrecs = cache(async function getMyDrecs(): Promise<DrecsBalance> {
  return api<DrecsBalance>(endpoints.users.drecs);
});

export async function patchMe(payload: UserPatch): Promise<User> {
  return api<User>(endpoints.users.me, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadMyLogo(file: File): Promise<User> {
  const form = new FormData();
  form.set("file", file);
  return api<User>(endpoints.users.logo, {
    method: "POST",
    body: form,
  });
}

export async function deleteMyLogo(): Promise<User> {
  return api<User>(endpoints.users.logo, {
    method: "DELETE",
  });
}
