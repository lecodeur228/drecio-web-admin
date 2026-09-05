import type { OutputKind } from "@/types/api";

/** Doit matcher FastAPI `generation_cost_drecs` / `video_generation_cost_drecs`. */
export const IMAGE_COST_DRECS = 1;
export const VIDEO_COST_DRECS = 5;

/** Doit matcher FastAPI `drec_price_fcfa` / `min_topup_fcfa`. */
export const DREC_PRICE_FCFA = 50;
export const MIN_TOPUP_FCFA = 500;
export const MIN_TOPUP_DRECS = Math.ceil(MIN_TOPUP_FCFA / DREC_PRICE_FCFA);

export const TOPUP_PRESETS_FCFA = [500, 1000, 2500, 5000] as const;

export function costForKind(kind: OutputKind): number {
  return kind === "video" ? VIDEO_COST_DRECS : IMAGE_COST_DRECS;
}

export function costForGeneration(kind: OutputKind, variantCount = 1): number {
  if (kind === "video") return VIDEO_COST_DRECS;
  const n = Math.max(1, Math.min(7, Math.floor(variantCount) || 1));
  return IMAGE_COST_DRECS * n;
}

export function drecLabel(n: number): string {
  return n === 1 ? "1 Drec" : `${n} Drecs`;
}

export function fcfaToDrecs(fcfa: number): number {
  return Math.floor(fcfa / DREC_PRICE_FCFA);
}

export function drecsToFcfa(drecs: number): number {
  return drecs * DREC_PRICE_FCFA;
}

export function costHintValues() {
  return {
    photo: drecLabel(IMAGE_COST_DRECS),
    video: drecLabel(VIDEO_COST_DRECS),
  };
}

export function rateHintValues() {
  return {
    price: DREC_PRICE_FCFA,
    min: MIN_TOPUP_FCFA,
    drecs: drecLabel(MIN_TOPUP_DRECS),
  };
}
