import "server-only";

import { costForKind, DREC_PRICE_FCFA } from "@/lib/pricing";
import type {
  AdminArticleDetail,
  AdminArticleListItem,
  AdminGenerationDetail,
  AdminGenerationListItem,
  AdminOverview,
  AdminSystemHealth,
  AdminTransactionListItem,
  AdminUserDetail,
  AdminUserListItem,
} from "@/types/admin";
import type { Article, Generation, User, UserPatch } from "@/types/api";

import { ApiError } from "./errors";
import { endpoints } from "./endpoints";
import {
  MOCK_ARTICLES,
  MOCK_GENERATIONS,
  MOCK_TRANSACTIONS,
  MOCK_USER,
  mockTopup,
} from "./mock-data";

let mockUser: User = { ...MOCK_USER };
const mockLiveGenerations = new Map<string, Generation>();

function parseBody<T>(init: RequestInit): T | null {
  if (!init.body || init.body instanceof FormData) return null;
  try {
    return JSON.parse(String(init.body)) as T;
  } catch {
    return null;
  }
}

function findArticle(id: string): Article | undefined {
  return MOCK_ARTICLES.find((article) => article.id === id);
}

function findGeneration(id: string): Generation | undefined {
  return mockLiveGenerations.get(id) ?? MOCK_GENERATIONS.find((generation) => generation.id === id);
}

function completeMockGeneration(generation: Generation): Generation {
  const sample = MOCK_GENERATIONS[0];
  if (generation.output_kind === "video") {
    return {
      ...generation,
      status: "completed",
      result_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      result_cloudinary_public_id: "mock/video",
      completed_at: new Date().toISOString(),
    };
  }
  return {
    ...generation,
    status: "completed",
    result_url: sample.result_url,
    result_cloudinary_public_id: sample.result_cloudinary_public_id,
    mannequin_profile: sample.mannequin_profile,
    completed_at: new Date().toISOString(),
  };
}

export async function mockApiResponse<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");

  if (pathname === endpoints.users.me) {
    if (method === "PATCH") {
      const patch = parseBody<UserPatch>(init) ?? {};
      mockUser = {
        ...mockUser,
        display_name:
          patch.display_name !== undefined
            ? patch.display_name
            : mockUser.display_name,
        phone: patch.phone !== undefined ? patch.phone : mockUser.phone,
      };
      return mockUser as T;
    }
    return mockUser as T;
  }

  if (pathname === endpoints.users.drecs) {
    return { drecs_balance: mockUser.drecs_balance } as T;
  }

  if (pathname === endpoints.articles.collection) {
    if (method === "POST") {
      const form = init.body instanceof FormData ? init.body : null;
      const article: Article = {
        id: `art-mock-${Date.now()}`,
        user_id: mockUser.id,
        image_url:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
        cloudinary_public_id: "mock/new",
        categorie: form?.get("categorie") ? String(form.get("categorie")) : null,
        description: form?.get("description") ? String(form.get("description")) : null,
        attributs_ia: null,
        title: null,
        price_fcfa: null,
        cover_url: null,
        created_at: new Date().toISOString(),
      };
      return article as T;
    }
    return MOCK_ARTICLES as T;
  }

  const articleMatch = pathname.match(/^\/v1\/articles\/([^/]+)$/);
  if (articleMatch) {
    const article = findArticle(articleMatch[1]);
    if (!article) {
      throw new ApiError(404, "not_found", "Article introuvable.");
    }
    if (method === "PATCH") {
      const patch = parseBody<{ categorie?: string | null }>(init) ?? {};
      if (patch.categorie !== undefined) {
        article.categorie = patch.categorie;
      }
    }
    return article as T;
  }

  if (pathname === endpoints.generations.collection) {
    if (method === "POST") {
      const body = parseBody<{ article_id?: string; output_kind?: string }>(init);
      const articleId = body?.article_id ?? "art-001";
      const outputKind = body?.output_kind === "video" ? "video" : "image";
      const generation: Generation = {
        id: `gen-mock-${Date.now()}`,
        article_id: articleId,
        user_id: mockUser.id,
        status: "processing",
        output_kind: outputKind,
        variant_count: 1,
        watermark_enabled: false,
        mannequin_profile: { genre: "femme", morphologie: "M" },
        result_url: null,
        result_urls: null,
        result_cloudinary_public_id: null,
        cost_drecs: costForKind(outputKind),
        error_message: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      };
      mockLiveGenerations.set(generation.id, generation);
      return generation as T;
    }
    const articleId = params.get("article_id");
    const live = [...mockLiveGenerations.values()];
    const list = [...live, ...MOCK_GENERATIONS];
    return (articleId ? list.filter((g) => g.article_id === articleId) : list) as T;
  }

  const generationMatch = pathname.match(/^\/v1\/generations\/([^/]+)$/);
  if (generationMatch) {
    let generation = findGeneration(generationMatch[1]);
    if (!generation) {
      throw new ApiError(404, "not_found", "Génération introuvable.");
    }
    if (mockLiveGenerations.has(generation.id) && generation.status !== "completed") {
      generation = completeMockGeneration(generation);
      mockLiveGenerations.set(generation.id, generation);
    }
    return generation as T;
  }

  if (pathname === endpoints.credits.topup && method === "POST") {
    const body = parseBody<{ drecs?: number }>(init);
    return mockTopup(body?.drecs ?? 5) as T;
  }

  if (pathname === endpoints.credits.transactions && method === "GET") {
    return MOCK_TRANSACTIONS as T;
  }

  const admin = mockAdminHandlers(pathname, method, params, init);
  if (admin !== undefined) {
    return admin as T;
  }

  throw new ApiError(
    501,
    "design_mode",
    `Route mock non implémentée : ${method} ${pathname}`,
  );
}

function mockAdminUsers(): AdminUserListItem[] {
  return [
    {
      id: mockUser.id,
      email: mockUser.email,
      phone: mockUser.phone,
      roles: [...mockUser.roles],
      display_name: mockUser.display_name,
      drecs_balance: mockUser.drecs_balance,
      articles_count: MOCK_ARTICLES.length,
      generations_count: MOCK_GENERATIONS.length,
      created_at: mockUser.created_at,
    },
    {
      id: "dev-user-002",
      email: "vendeur@drecio.design",
      phone: null,
      roles: ["seller"],
      display_name: "Studio Kofi",
      drecs_balance: 3,
      articles_count: 1,
      generations_count: 0,
      created_at: "2025-02-10T08:00:00.000Z",
    },
  ];
}

function mockAdminGenerations(): AdminGenerationListItem[] {
  return MOCK_GENERATIONS.map((generation) => {
    const article = findArticle(generation.article_id);
    return {
      id: generation.id,
      article_id: generation.article_id,
      user_id: generation.user_id,
      user_email: mockUser.email,
      user_display_name: mockUser.display_name,
      article_title: article?.title ?? article?.description ?? null,
      article_categorie: article?.categorie ?? null,
      status: generation.status,
      output_kind: generation.output_kind,
      cost_drecs: generation.cost_drecs,
      error_message: generation.error_message,
      result_url: generation.result_url,
      created_at: generation.created_at,
      completed_at: generation.completed_at,
    };
  });
}

function mockAdminTransactions(): AdminTransactionListItem[] {
  return MOCK_TRANSACTIONS.map((item) => ({
    id: item.id,
    user_id: mockUser.id,
    user_email: mockUser.email,
    user_display_name: mockUser.display_name,
    type: item.type,
    montant_drecs: item.montant_drecs,
    montant_fcfa: item.montant_fcfa,
    fedapay_reference: item.type === "credit" ? `mock-feda-${item.id}` : null,
    generation_id: item.generation_id,
    status: item.status,
    created_at: item.created_at,
  }));
}

function mockAdminArticles(): AdminArticleListItem[] {
  return MOCK_ARTICLES.map((article) => ({
    id: article.id,
    user_id: article.user_id,
    user_email: mockUser.email,
    user_display_name: mockUser.display_name,
    title: article.title,
    description: article.description,
    categorie: article.categorie,
    image_url: article.image_url,
    cover_url: article.cover_url,
    price_fcfa: article.price_fcfa,
    generations_count: MOCK_GENERATIONS.filter((g) => g.article_id === article.id)
      .length,
    created_at: article.created_at,
  }));
}

function mockAdminHandlers(
  pathname: string,
  method: string,
  params: URLSearchParams,
  init: RequestInit,
): unknown | undefined {
  if (!pathname.startsWith("/v1/admin")) return undefined;

  if (pathname === endpoints.admin.overview && method === "GET") {
    const gens = mockAdminGenerations();
    const failed = gens.filter((g) => g.status === "failed");
    const completed = gens.filter((g) => g.status === "completed");
    const overview: AdminOverview = {
      period_days: Number(params.get("period_days") ?? 7),
      users_total: mockAdminUsers().length,
      users_new: 1,
      drecs_balance_sum: mockAdminUsers().reduce((sum, u) => sum + u.drecs_balance, 0),
      generations_total: gens.length,
      generations_completed: completed.length,
      generations_failed: failed.length,
      generations_failure_rate: gens.length ? failed.length / gens.length : 0,
      drecs_debited: 2,
      drecs_credited: 10,
      topup_fcfa_completed: 500,
      topup_completed: 1,
      topup_pending: 0,
      topup_failed: 0,
      stuck_generations: gens.filter((g) => g.status === "processing").length,
      recent_failures: failed.slice(0, 5),
      stale_pending_topups: [],
    };
    return overview;
  }

  if (pathname === endpoints.admin.financeSummary && method === "GET") {
    const txs = mockAdminTransactions();
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const monthTxs = txs.filter(
      (t) => t.created_at && new Date(t.created_at) >= monthStart,
    );
    const periodStats = (items: AdminTransactionListItem[]) => {
      const topups = items.filter(
        (t) => t.type === "credit" && t.montant_fcfa != null,
      );
      return {
        revenue_fcfa: topups
          .filter((t) => t.status === "completed")
          .reduce((sum, t) => sum + (t.montant_fcfa ?? 0), 0),
        topup_completed: topups.filter((t) => t.status === "completed").length,
        topup_pending: topups.filter((t) => t.status === "pending").length,
        topup_failed: topups.filter((t) => t.status === "failed").length,
        drecs_credited: items
          .filter((t) => t.type === "credit" && t.status === "completed")
          .reduce((sum, t) => sum + t.montant_drecs, 0),
        drecs_debited: items
          .filter(
            (t) =>
              t.type === "debit" &&
              (t.status === "completed" || t.status === "pending"),
          )
          .reduce((sum, t) => sum + t.montant_drecs, 0),
      };
    };
    return {
      month: periodStats(monthTxs),
      all_time: periodStats(txs),
      month_start: monthStart.toISOString(),
      drec_price_fcfa: DREC_PRICE_FCFA,
      stale_pending_topups: txs.filter(
        (t) =>
          t.type === "credit" &&
          t.status === "pending" &&
          t.montant_fcfa != null &&
          t.created_at != null &&
          Date.now() - new Date(t.created_at).getTime() > 60 * 60 * 1000,
      ),
    };
  }

  if (pathname === endpoints.admin.users && method === "GET") {
    let users = mockAdminUsers();
    const q = params.get("q")?.toLowerCase();
    const role = params.get("role");
    if (q) {
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.display_name?.toLowerCase().includes(q) ?? false),
      );
    }
    if (role === "admin" || role === "seller") {
      users = users.filter((u) => u.roles.includes(role));
    }
    return users;
  }

  if (pathname === endpoints.admin.roles && method === "GET") {
    return [
      { id: "role-seller", name: "seller", guard_name: "api" },
      { id: "role-admin", name: "admin", guard_name: "api" },
    ];
  }

  const userRolesMatch = pathname.match(/^\/v1\/admin\/users\/([^/]+)\/roles$/);
  if (userRolesMatch && method === "PUT") {
    const user = mockAdminUsers().find((u) => u.id === userRolesMatch[1]);
    if (!user) throw new ApiError(404, "not_found", "User not found");
    const body = parseBody<{ roles?: string[] }>(init);
    const next = (body?.roles ?? []).filter(Boolean);
    if (next.length === 0) {
      throw new ApiError(400, "invalid", "At least one role is required");
    }
    user.roles = next;
    if (user.id === mockUser.id) {
      mockUser.roles = next as typeof mockUser.roles;
    }
    return user;
  }

  const userMatch = pathname.match(/^\/v1\/admin\/users\/([^/]+)$/);
  if (userMatch) {
    const user = mockAdminUsers().find((u) => u.id === userMatch[1]);
    if (!user) throw new ApiError(404, "not_found", "User not found");
    if (method === "GET") {
      const detail: AdminUserDetail = {
        ...user,
        transactions: mockAdminTransactions().filter((t) => t.user_id === user.id),
        recent_articles: mockAdminArticles().filter((a) => a.user_id === user.id),
        recent_generations: mockAdminGenerations().filter((g) => g.user_id === user.id),
      };
      return detail;
    }
  }

  const userDrecsMatch = pathname.match(/^\/v1\/admin\/users\/([^/]+)\/drecs$/);
  if (userDrecsMatch && method === "POST") {
    const body = parseBody<{ delta?: number; reason?: string }>(init);
    const delta = body?.delta ?? 0;
    if (!Number.isInteger(delta) || delta === 0) {
      throw new ApiError(400, "validation_error", "Invalid delta");
    }
    if (userDrecsMatch[1] === mockUser.id) {
      mockUser.drecs_balance = Math.max(0, mockUser.drecs_balance + delta);
    }
    return {
      drecs_balance:
        userDrecsMatch[1] === mockUser.id
          ? mockUser.drecs_balance
          : Math.max(0, 3 + delta),
      transaction_id: `txn-admin-${Date.now()}`,
    };
  }

  if (pathname === endpoints.admin.generations && method === "GET") {
    let gens = mockAdminGenerations();
    const status = params.get("status");
    const kind = params.get("output_kind");
    if (status) gens = gens.filter((g) => g.status === status);
    if (kind) gens = gens.filter((g) => g.output_kind === kind);
    return gens;
  }

  const genRefundMatch = pathname.match(/^\/v1\/admin\/generations\/([^/]+)\/refund$/);
  if (genRefundMatch && method === "POST") {
    const gen = findGeneration(genRefundMatch[1]);
    if (!gen) throw new ApiError(404, "not_found", "Generation not found");
    const debit = MOCK_TRANSACTIONS.find((t) => t.generation_id === gen.id);
    if (!debit) {
      return { refunded: false, drecs_balance: mockUser.drecs_balance, message: "No debit transaction found" };
    }
    if (debit.status === "refunded") {
      return { refunded: false, drecs_balance: mockUser.drecs_balance, message: "Already refunded" };
    }
    debit.status = "refunded";
    mockUser.drecs_balance += debit.montant_drecs;
    return {
      refunded: true,
      drecs_balance: mockUser.drecs_balance,
      message: `Refunded ${debit.montant_drecs} Drecs`,
    };
  }

  const genMatch = pathname.match(/^\/v1\/admin\/generations\/([^/]+)$/);
  if (genMatch && method === "GET") {
    const listItem = mockAdminGenerations().find((g) => g.id === genMatch[1]);
    const generation = findGeneration(genMatch[1]);
    if (!listItem || !generation) {
      throw new ApiError(404, "not_found", "Generation not found");
    }
    const article = findArticle(generation.article_id);
    const debit = MOCK_TRANSACTIONS.find((t) => t.generation_id === generation.id);
    const detail: AdminGenerationDetail = {
      ...listItem,
      article_image_url: article?.image_url ?? null,
      mannequin_profile: generation.mannequin_profile,
      debit_status: debit?.status ?? null,
      debit_transaction_id: debit?.id ?? null,
    };
    return detail;
  }

  if (pathname === endpoints.admin.transactions && method === "GET") {
    let items = mockAdminTransactions();
    const type = params.get("type");
    const status = params.get("status");
    const createdAfter = params.get("created_after");
    const createdBefore = params.get("created_before");
    if (type) items = items.filter((t) => t.type === type);
    if (status) items = items.filter((t) => t.status === status);
    if (createdAfter) {
      const after = new Date(createdAfter);
      items = items.filter(
        (t) => t.created_at && new Date(t.created_at) >= after,
      );
    }
    if (createdBefore) {
      const before = new Date(createdBefore);
      items = items.filter(
        (t) => t.created_at && new Date(t.created_at) < before,
      );
    }
    return items;
  }

  if (pathname === endpoints.admin.articles && method === "GET") {
    let items = mockAdminArticles();
    const q = params.get("q")?.toLowerCase();
    if (q) {
      items = items.filter(
        (a) =>
          (a.title?.toLowerCase().includes(q) ?? false) ||
          (a.description?.toLowerCase().includes(q) ?? false),
      );
    }
    return items;
  }

  const articleMatch = pathname.match(/^\/v1\/admin\/articles\/([^/]+)$/);
  if (articleMatch) {
    const item = mockAdminArticles().find((a) => a.id === articleMatch[1]);
    if (!item) throw new ApiError(404, "not_found", "Article not found");
    if (method === "PATCH") {
      const body = parseBody<{ categorie?: string | null }>(init);
      const article = findArticle(articleMatch[1]);
      if (article && body && "categorie" in body) {
        article.categorie = body.categorie ?? null;
        item.categorie = body.categorie ?? null;
      }
      return item;
    }
    if (method === "GET") {
      const detail: AdminArticleDetail = {
        ...item,
        generations: mockAdminGenerations().filter((g) => g.article_id === item.id),
      };
      return detail;
    }
  }


  if (pathname === endpoints.admin.placementsDraftAi && method === "POST") {
    const body = parseBody<{
      admin_intent?: string;
      category?: string;
    }>(init);
    const intent = String(body?.admin_intent || "crop at the hip");
    return {
      tryon_framing:
        `The item belongs at the described zone. ${intent}. ` +
        "Crop so the item dominates. Do NOT confuse it with unrelated body zones.",
      packshot_hint: "Hero packshot of this item. Fill most of the frame.",
      styled_clause: "Keep a simple solid outfit so the item stays the hero.",
      label_en: "New zone",
      category: body?.category || "accessory",
      source: "mock",
    };
  }

  if (pathname === endpoints.admin.rodiumModels && method === "GET") {
    return {
      models: [
        { id: "openai/gpt-image-2", owned_by: "openai", kind: "image" },
        { id: "google/gemini-3.1-flash-image", owned_by: "google", kind: "image" },
        { id: "google/gemini-3.1-flash-lite-image", owned_by: "google", kind: "image" },
        { id: "google/veo-3.1", owned_by: "google", kind: "video" },
        { id: "google/veo-3.1-fast", owned_by: "google", kind: "video" },
        { id: "google/veo-3.1-lite", owned_by: "google", kind: "video" },
      ],
      image_models: [
        { id: "openai/gpt-image-2", owned_by: "openai", kind: "image" },
        { id: "google/gemini-3.1-flash-image", owned_by: "google", kind: "image" },
        { id: "google/gemini-3.1-flash-lite-image", owned_by: "google", kind: "image" },
      ],
      video_models: [
        { id: "google/veo-3.1", owned_by: "google", kind: "video" },
        { id: "google/veo-3.1-fast", owned_by: "google", kind: "video" },
        { id: "google/veo-3.1-lite", owned_by: "google", kind: "video" },
      ],
    };
  }

  if (pathname === endpoints.admin.systemConfig) {
    const framing = {
      shoes: "shoes framing",
      top: "top framing",
      bottom: "bottom framing",
      dress: "dress framing",
      accessory: "accessory framing",
      unknown: "unknown framing",
    };
    const config = {
      image_model: "openai/gpt-image-2",
      image_model_fallback: "openai/gpt-image-2",
      video_model: "google/veo-3.1-lite",
      video_model_fallback: "google/veo-3.1-lite",
      video_model_lite: "google/veo-3.1-lite",
      enable_image_generation: true,
      enable_video_generation: true,
      prompt_mannequin: "Mannequin prompt",
      prompt_framing: framing,
      prompt_video_base: "Video base",
      prompt_video_shoes_suffix: "Shoes orbit",
      prompt_video_default_suffix: "Default orbit",
      placement_zones: [
        {
          id: "top",
          enabled: true,
          category: "top",
          label_fr: "Haut (torse)",
          label_en: "Top (torso)",
          tryon_framing: "top framing",
          packshot_hint: "top packshot",
          styled_clause: "top styled",
        },
        {
          id: "wrist",
          enabled: true,
          category: "accessory",
          label_fr: "Poignet",
          label_en: "Wrist",
          tryon_framing: "wrist framing",
          packshot_hint: "wrist packshot",
          styled_clause: "wrist styled",
        },
      ],
      defaults: {
        placement_zones: [
          {
            id: "top",
            enabled: true,
            category: "top",
            label_fr: "Haut (torse)",
            label_en: "Top (torso)",
            tryon_framing: "top framing",
            packshot_hint: "top packshot",
            styled_clause: "top styled",
          },
        ],
      },
      rodium_configured: true,
      api_status: "ok",
      database_status: "ok",
    };
    if (method === "GET") return config;
    if (method === "PATCH") {
      const body = parseBody<Record<string, unknown>>(init) ?? {};
      return { ...config, ...body, prompt_framing: { ...framing, ...(body.prompt_framing as object || {}) } };
    }
  }

  if (pathname === endpoints.admin.systemHealth && method === "GET") {
    const health: AdminSystemHealth = {
      api_status: "ok",
      database_status: "ok",
      rodium_configured: true,
      fedapay_configured: true,
      image_model: "mock-image",
      video_model: "mock-video",
      stuck_generations: mockAdminGenerations().filter((g) => g.status === "processing")
        .length,
      generation_cost_drecs: 1,
      video_generation_cost_drecs: 5,
      drec_price_fcfa: DREC_PRICE_FCFA,
    };
    return health;
  }

  return undefined;
}
