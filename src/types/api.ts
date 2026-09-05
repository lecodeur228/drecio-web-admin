export type UserRole = "seller" | "admin";

export type User = {
  id: string;
  email: string;
  phone: string | null;
  roles: UserRole[];
  permissions: string[];
  display_name: string | null;
  logo_url: string | null;
  drecs_balance: number;
  created_at: string | null;
};

export type DrecsBalance = {
  drecs_balance: number;
};

export type Article = {
  id: string;
  user_id: string;
  image_url: string;
  cloudinary_public_id: string;
  categorie: string | null;
  description: string | null;
  attributs_ia: Record<string, unknown> | null;
  title: string | null;
  price_fcfa: number | null;
  cover_url: string | null;
  created_at: string | null;
};

export type UserPatch = {
  display_name?: string | null;
  phone?: string | null;
};

export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export type OutputKind = "image" | "video";

export type Generation = {
  id: string;
  article_id: string;
  user_id: string;
  status: GenerationStatus;
  output_kind: OutputKind;
  variant_count: number;
  watermark_enabled: boolean;
  mannequin_profile: Record<string, unknown> | null;
  result_url: string | null;
  result_urls: string[] | null;
  result_cloudinary_public_id: string | null;
  cost_drecs: number;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
};

export type TopupResponse = {
  reference: string;
  checkout_url: string;
  drecs: number;
  amount_fcfa: number;
};

export type CreditTransaction = {
  id: string;
  type: "credit" | "debit";
  montant_drecs: number;
  montant_fcfa: number | null;
  status: "pending" | "completed" | "failed" | "refunded";
  generation_id: string | null;
  created_at: string | null;
};
