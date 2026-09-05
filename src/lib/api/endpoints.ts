/**
 * Catalogue FastAPI — chemins utilisés par le BFF Next (`api()`).
 *
 * Auth : Bearer JWT Supabase, sauf health + webhook FedaPay.
 */
export const endpoints = {
  users: {
    me: "/v1/users/me",
    drecs: "/v1/users/me/drecs",
    logo: "/v1/users/me/logo",
  },

  articles: {
    collection: "/v1/articles",
    byId: (id: string) => `/v1/articles/${id}` as const,
  },

  generations: {
    collection: "/v1/generations",
    list: (articleId?: string) =>
      articleId
        ? (`/v1/generations?article_id=${encodeURIComponent(articleId)}` as const)
        : ("/v1/generations" as const),
    byId: (id: string) => `/v1/generations/${id}` as const,
    download: (id: string, params?: { url?: string; variant?: number; filename?: string }) => {
      const search = new URLSearchParams();
      if (params?.url) search.set("url", params.url);
      if (params?.variant != null) search.set("variant", String(params.variant));
      if (params?.filename) search.set("filename", params.filename);
      const q = search.toString();
      return `/v1/generations/${id}/download${q ? `?${q}` : ""}` as const;
    },
  },

  credits: {
    topup: "/v1/credits/topup",
    transactions: "/v1/credits/transactions",
  },

  admin: {
    overview: "/v1/admin/overview",
    financeSummary: "/v1/admin/finance/summary",
    users: "/v1/admin/users",
    user: (id: string) => `/v1/admin/users/${id}` as const,
    userRoles: (id: string) => `/v1/admin/users/${id}/roles` as const,
    userDrecs: (id: string) => `/v1/admin/users/${id}/drecs` as const,
    roles: "/v1/admin/roles",
    permissions: "/v1/admin/permissions",
    audit: "/v1/admin/audit",
    generations: "/v1/admin/generations",
    generation: (id: string) => `/v1/admin/generations/${id}` as const,
    generationRefund: (id: string) => `/v1/admin/generations/${id}/refund` as const,
    transactions: "/v1/admin/transactions",
    articles: "/v1/admin/articles",
    article: (id: string) => `/v1/admin/articles/${id}` as const,
    systemHealth: "/v1/admin/system/health",
    systemConfig: "/v1/admin/system/config",
    placementsDraftAi: "/v1/admin/system/placements/draft-ai-texts",
    rodiumModels: "/v1/admin/system/rodium-models",
  },
} as const;
