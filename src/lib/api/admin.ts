import "server-only";

import type {
  AdminAuditItem,
  AdminFinanceSummary,
  AdminGenerationListItem,
  AdminOverview,
  AdminPermission,
  AdminRefundResult,
  AdminRole,
  AdminSystemConfig,
  AdminSystemConfigPatch,
  AdminSystemHealth,
  AdminTransactionListItem,
  AdminUserDetail,
  AdminUserListItem,
  PlacementAiTextsDraft,
  RodiumModelsCatalogue,
} from "@/types/admin";
import type { UserRole } from "@/types/api";

import { api } from "./client";
import { endpoints } from "./endpoints";

function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const raw = search.toString();
  return raw ? `?${raw}` : "";
}

export async function getAdminOverview(periodDays = 7): Promise<AdminOverview> {
  return api<AdminOverview>(`${endpoints.admin.overview}${qs({ period_days: periodDays })}`);
}

export async function getAdminFinanceSummary(): Promise<AdminFinanceSummary> {
  return api<AdminFinanceSummary>(endpoints.admin.financeSummary);
}

export async function listAdminTransactions(params: {
  type?: "credit" | "debit";
  status?: "pending" | "completed" | "failed" | "refunded";
  user_id?: string;
  fedapay_reference?: string;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminTransactionListItem[]> {
  return api<AdminTransactionListItem[]>(
    `${endpoints.admin.transactions}${qs(params)}`,
  );
}

export async function listAdminUsers(params: {
  q?: string;
  role?: UserRole;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminUserListItem[]> {
  return api<AdminUserListItem[]>(`${endpoints.admin.users}${qs(params)}`);
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  return api<AdminUserDetail>(endpoints.admin.user(id));
}

export async function patchAdminUserRole(
  id: string,
  role: UserRole,
): Promise<AdminUserListItem> {
  const roles = role === "admin" ? ["admin"] : ["seller"];
  return putAdminUserRoles(id, roles);
}

export async function putAdminUserRoles(
  id: string,
  roles: string[],
): Promise<AdminUserListItem> {
  return api<AdminUserListItem>(endpoints.admin.userRoles(id), {
    method: "PUT",
    body: JSON.stringify({ roles }),
  });
}

export async function listAdminRoles(): Promise<AdminRole[]> {
  return api<AdminRole[]>(endpoints.admin.roles);
}

export async function listAdminPermissions(): Promise<AdminPermission[]> {
  return api<AdminPermission[]>(endpoints.admin.permissions);
}

export async function listAdminAudit(params: {
  action?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminAuditItem[]> {
  return api<AdminAuditItem[]>(`${endpoints.admin.audit}${qs(params)}`);
}

export async function listAdminGenerations(params: {
  status?: string;
  output_kind?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminGenerationListItem[]> {
  return api<AdminGenerationListItem[]>(
    `${endpoints.admin.generations}${qs(params)}`,
  );
}

export async function refundAdminGeneration(
  id: string,
): Promise<AdminRefundResult> {
  return api<AdminRefundResult>(endpoints.admin.generationRefund(id), {
    method: "POST",
  });
}

export async function getAdminSystemHealth(): Promise<AdminSystemHealth> {
  return api<AdminSystemHealth>(endpoints.admin.systemHealth);
}

export async function getAdminSystemConfig(): Promise<AdminSystemConfig> {
  return api<AdminSystemConfig>(endpoints.admin.systemConfig);
}

export async function patchAdminSystemConfig(
  patch: AdminSystemConfigPatch,
): Promise<AdminSystemConfig> {
  return api<AdminSystemConfig>(endpoints.admin.systemConfig, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function draftPlacementAiTexts(input: {
  admin_intent: string;
  label_fr?: string;
  category?: string;
  zone_id?: string;
}): Promise<PlacementAiTextsDraft> {
  return api<PlacementAiTextsDraft>(endpoints.admin.placementsDraftAi, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listRodiumModels(): Promise<RodiumModelsCatalogue> {
  return api<RodiumModelsCatalogue>(endpoints.admin.rodiumModels);
}
