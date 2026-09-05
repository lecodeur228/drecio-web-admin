export type AdminUserListItem = {
  id: string;
  email: string;
  phone: string | null;
  roles: Array<"seller" | "admin" | string>;
  display_name: string | null;
  drecs_balance: number;
  articles_count: number;
  generations_count: number;
  created_at: string | null;
};

export type AdminGenerationListItem = {
  id: string;
  article_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string | null;
  article_title: string | null;
  article_categorie: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  output_kind: "image" | "video";
  cost_drecs: number;
  error_message: string | null;
  result_url: string | null;
  created_at: string | null;
  completed_at: string | null;
};

export type AdminTransactionListItem = {
  id: string;
  user_id: string;
  user_email: string;
  user_display_name: string | null;
  type: "credit" | "debit";
  montant_drecs: number;
  montant_fcfa: number | null;
  fedapay_reference: string | null;
  generation_id: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string | null;
};

export type AdminArticleListItem = {
  id: string;
  user_id: string;
  user_email: string;
  user_display_name: string | null;
  title: string | null;
  description: string | null;
  categorie: string | null;
  image_url: string;
  cover_url: string | null;
  price_fcfa: number | null;
  generations_count: number;
  created_at: string | null;
};

export type AdminOverview = {
  period_days: number;
  users_total: number;
  users_new: number;
  drecs_balance_sum: number;
  generations_total: number;
  generations_completed: number;
  generations_failed: number;
  generations_failure_rate: number;
  drecs_debited: number;
  drecs_credited: number;
  topup_fcfa_completed: number;
  topup_completed: number;
  topup_pending: number;
  topup_failed: number;
  stuck_generations: number;
  recent_failures: AdminGenerationListItem[];
  stale_pending_topups: AdminTransactionListItem[];
};

export type AdminFinancePeriodStats = {
  revenue_fcfa: number;
  topup_completed: number;
  topup_pending: number;
  topup_failed: number;
  drecs_credited: number;
  drecs_debited: number;
};

export type AdminFinanceSummary = {
  month: AdminFinancePeriodStats;
  all_time: AdminFinancePeriodStats;
  month_start: string;
  drec_price_fcfa: number;
  stale_pending_topups: AdminTransactionListItem[];
};

export type AdminUserDetail = AdminUserListItem & {
  transactions: AdminTransactionListItem[];
  recent_articles: AdminArticleListItem[];
  recent_generations: AdminGenerationListItem[];
};

export type AdminGenerationDetail = AdminGenerationListItem & {
  article_image_url: string | null;
  mannequin_profile: Record<string, unknown> | null;
  debit_status: "pending" | "completed" | "failed" | "refunded" | null;
  debit_transaction_id: string | null;
};

export type AdminArticleDetail = AdminArticleListItem & {
  generations: AdminGenerationListItem[];
};

export type AdminSystemHealth = {
  api_status: string;
  database_status: string;
  rodium_configured: boolean;
  fedapay_configured: boolean;
  image_model: string;
  video_model: string;
  stuck_generations: number;
  generation_cost_drecs: number;
  video_generation_cost_drecs: number;
  drec_price_fcfa: number;
};

export type AdminSystemConfig = {
  image_model: string;
  image_model_fallback: string;
  video_model: string;
  video_model_fallback: string;
  video_model_lite: string;
  enable_image_generation: boolean;
  enable_video_generation: boolean;
  prompt_mannequin: string;
  prompt_framing: Record<string, string>;
  prompt_video_base: string;
  prompt_video_shoes_suffix: string;
  prompt_video_default_suffix: string;
  placement_zones: PlacementZoneConfig[];
  defaults: Record<string, unknown>;
  rodium_configured: boolean;
  api_status: string;
  database_status: string;
};

export type PlacementZoneConfig = {
  id: string;
  enabled: boolean;
  category: string;
  label_fr: string;
  label_en: string;
  tryon_framing: string;
  packshot_hint: string;
  styled_clause: string;
};

export type PlacementAiTextsDraft = {
  tryon_framing: string;
  packshot_hint: string;
  styled_clause: string;
  label_en: string;
  category: string;
  source: string;
};

export type AdminSystemConfigPatch = {
  image_model?: string;
  image_model_fallback?: string;
  video_model?: string;
  video_model_fallback?: string;
  video_model_lite?: string;
  enable_image_generation?: boolean;
  enable_video_generation?: boolean;
  prompt_mannequin?: string;
  prompt_framing?: Record<string, string>;
  prompt_video_base?: string;
  prompt_video_shoes_suffix?: string;
  prompt_video_default_suffix?: string;
  placement_zones?: PlacementZoneConfig[];
};

export type RodiumModelItem = {
  id: string;
  owned_by: string | null;
  kind: "image" | "video" | "other";
};

export type RodiumModelsCatalogue = {
  models: RodiumModelItem[];
  image_models: RodiumModelItem[];
  video_models: RodiumModelItem[];
};

export type AdminDrecsAdjustResult = {
  drecs_balance: number;
  transaction_id: string;
};

export type AdminRefundResult = {
  refunded: boolean;
  drecs_balance: number | null;
  message: string;
};

export type AdminRole = {
  id: string;
  name: string;
  guard_name: string;
  permissions: string[];
  users_count: number;
};

export type AdminPermission = {
  id: string;
  name: string;
  guard_name: string;
};

export type AdminAuditItem = {
  id: string;
  admin_user_id: string;
  admin_email: string;
  target_user_id: string | null;
  target_email: string | null;
  action: string;
  reason: string | null;
  payload: Record<string, unknown> | null;
  created_at: string | null;
};
