"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  adminDraftPlacementAiTexts,
  adminResetPlacements,
  adminSavePlacements,
  type AdminActionState,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PlacementZoneConfig } from "@/types/admin";

const CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "shoes",
  "accessory",
  "unknown",
] as const;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

function uniqueId(base: string, existing: string[]): string {
  const root = slugify(base) || "zone";
  if (!existing.includes(root)) return root;
  let n = 2;
  while (existing.includes(`${root}_${n}`)) n += 1;
  return `${root}_${n}`;
}

function blankZone(existingIds: string[]): PlacementZoneConfig {
  const id = uniqueId("nouvelle_zone", existingIds);
  return {
    id,
    enabled: true,
    category: "accessory",
    label_fr: "",
    label_en: "",
    tryon_framing: "",
    packshot_hint: "",
    styled_clause: "",
  };
}

function hasKeyword(text: string, keyword: string): boolean {
  return new RegExp(`(?:^|[^\\p{L}])${keyword}(?:[^\\p{L}]|$)`, "iu").test(
    text,
  );
}

function closestExample(
  zones: PlacementZoneConfig[],
  intent: string,
  category: string,
  excludeId?: string,
): PlacementZoneConfig | null {
  const pool = excludeId ? zones.filter((z) => z.id !== excludeId) : zones;
  if (!pool.length) return null;
  const text = `${intent} ${category}`.toLowerCase();
  const hints: [string[], string][] = [
    [["hanche", "taille", "ceinture", "hip", "waist"], "waist"],
    [["poignet", "montre", "bracelet"], "wrist"],
    [["collier", "necklace"], "neck"],
    [["chaussure", "pied"], "shoes"],
    [["pantalon", "jupe", "bas"], "bottom"],
    [["haut", "torse", "chemise"], "top"],
    [["robe"], "dress"],
    [["sac"], "bag"],
  ];
  for (const [keys, id] of hints) {
    if (keys.some((k) => hasKeyword(text, k))) {
      const found = pool.find((z) => z.id === id);
      if (found) return found;
    }
  }
  return pool.find((z) => z.category === category) ?? pool[0] ?? null;
}

export function SystemPlacementsForm({
  zones: initialZones = [],
}: {
  zones?: PlacementZoneConfig[];
}) {
  const t = useTranslations("admin.system");
  const [zones, setZones] = useState<PlacementZoneConfig[]>(
    () => initialZones ?? [],
  );

  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<PlacementZoneConfig | null>(null);
  const [addIntent, setAddIntent] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addAdvanced, setAddAdvanced] = useState(false);
  const [addGenerating, startAddGenerate] = useTransition();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOriginalId, setDetailOriginalId] = useState<string | null>(null);
  const [detailDraft, setDetailDraft] = useState<PlacementZoneConfig | null>(
    null,
  );
  const [detailIntent, setDetailIntent] = useState("");
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailAdvanced, setDetailAdvanced] = useState(true);
  const [detailGenerating, startDetailGenerate] = useTransition();

  const [state, action, pending] = useActionState(
    adminSavePlacements,
    {} as AdminActionState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    adminResetPlacements,
    {} as AdminActionState,
  );

  useEffect(() => {
    setZones(initialZones ?? []);
  }, [initialZones]);

  const enabledCount = zones.filter((zone) => zone.enabled).length;
  const addExample = addDraft
    ? closestExample(
        zones.length ? zones : initialZones,
        addIntent,
        addDraft.category,
      )
    : null;

  function updateZone(id: string, patch: Partial<PlacementZoneConfig>) {
    setZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone)),
    );
  }

  function moveZone(index: number, delta: number) {
    const next = index + delta;
    if (next < 0 || next >= zones.length) return;
    setZones((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  function openAddDialog() {
    setAddDraft(blankZone(zones.map((zone) => zone.id)));
    setAddIntent("");
    setAddError(null);
    setAddAdvanced(false);
    setAddOpen(true);
  }

  function closeAddDialog(open: boolean) {
    setAddOpen(open);
    if (!open) {
      setAddDraft(null);
      setAddIntent("");
      setAddError(null);
      setAddAdvanced(false);
    }
  }

  function openDetailDialog(zone: PlacementZoneConfig) {
    setDetailOriginalId(zone.id);
    setDetailDraft({ ...zone });
    setDetailIntent("");
    setDetailError(null);
    setDetailAdvanced(true);
    setDetailOpen(true);
  }

  function closeDetailDialog(open: boolean) {
    setDetailOpen(open);
    if (!open) {
      setDetailOriginalId(null);
      setDetailDraft(null);
      setDetailIntent("");
      setDetailError(null);
    }
  }

  function generateForAdd() {
    if (!addDraft) return;
    startAddGenerate(async () => {
      setAddError(null);
      const result = await adminDraftPlacementAiTexts({
        admin_intent: addIntent,
        label_fr: addDraft.label_fr,
        category: addDraft.category,
        zone_id: addDraft.id,
      });
      if (result.error || !result.data) {
        setAddError(result.error ?? t("draftAiError"));
        return;
      }
      const data = result.data;
      setAddDraft((prev) =>
        prev
          ? {
              ...prev,
              tryon_framing: data.tryon_framing,
              packshot_hint: data.packshot_hint,
              styled_clause: data.styled_clause,
              label_en: data.label_en || prev.label_en,
              category: data.category || prev.category,
            }
          : prev,
      );
      setAddAdvanced(true);
    });
  }

  function generateForDetail() {
    if (!detailDraft) return;
    startDetailGenerate(async () => {
      setDetailError(null);
      const result = await adminDraftPlacementAiTexts({
        admin_intent: detailIntent,
        label_fr: detailDraft.label_fr,
        category: detailDraft.category,
        zone_id: detailDraft.id,
      });
      if (result.error || !result.data) {
        setDetailError(result.error ?? t("draftAiError"));
        return;
      }
      const data = result.data;
      setDetailDraft((prev) =>
        prev
          ? {
              ...prev,
              tryon_framing: data.tryon_framing,
              packshot_hint: data.packshot_hint,
              styled_clause: data.styled_clause,
              label_en: data.label_en || prev.label_en,
              category: data.category || prev.category,
            }
          : prev,
      );
      setDetailAdvanced(true);
    });
  }

  function confirmAddZone() {
    if (!addDraft) return;
    const id = slugify(addDraft.id);
    if (!id) {
      setAddError(t("addPlacementIdRequired"));
      return;
    }
    if (zones.some((zone) => zone.id === id)) {
      setAddError(t("addPlacementIdTaken"));
      return;
    }
    if (!addDraft.label_fr.trim()) {
      setAddError(t("addPlacementLabelFrRequired"));
      return;
    }
    if (!addDraft.tryon_framing.trim()) {
      setAddError(t("addPlacementGenerateFirst"));
      return;
    }

    setZones((prev) => [
      ...prev,
      {
        ...addDraft,
        id,
        enabled: true,
        label_fr: addDraft.label_fr.trim(),
        label_en: (addDraft.label_en || addDraft.label_fr).trim(),
        tryon_framing: addDraft.tryon_framing.trim(),
        packshot_hint: addDraft.packshot_hint.trim(),
        styled_clause: addDraft.styled_clause.trim(),
      },
    ]);
    closeAddDialog(false);
  }

  function confirmDetailZone() {
    if (!detailDraft || !detailOriginalId) return;
    const nextId = slugify(detailDraft.id) || detailOriginalId;
    if (!detailDraft.label_fr.trim() || !detailDraft.label_en.trim()) {
      setDetailError(t("addPlacementLabelsRequired"));
      return;
    }
    if (!detailDraft.tryon_framing.trim()) {
      setDetailError(t("addPlacementTryonRequired"));
      return;
    }
    if (
      nextId !== detailOriginalId &&
      zones.some((zone) => zone.id === nextId)
    ) {
      setDetailError(t("addPlacementIdTaken"));
      return;
    }

    setZones((prev) =>
      prev.map((zone) =>
        zone.id === detailOriginalId
          ? {
              ...detailDraft,
              id: nextId,
              label_fr: detailDraft.label_fr.trim(),
              label_en: detailDraft.label_en.trim(),
              tryon_framing: detailDraft.tryon_framing.trim(),
              packshot_hint: detailDraft.packshot_hint.trim(),
              styled_clause: detailDraft.styled_clause.trim(),
            }
          : zone,
      ),
    );
    closeDetailDialog(false);
  }

  function removeDetailZone() {
    if (!detailOriginalId || zones.length <= 1) return;
    setZones((prev) => prev.filter((zone) => zone.id !== detailOriginalId));
    closeDetailDialog(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl space-y-1">
          <p className="text-sm text-muted-foreground">{t("placementsHint")}</p>
          <p className="text-xs text-muted-foreground">
            {t("placementsCount", {
              enabled: enabledCount,
              total: zones.length,
            })}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={openAddDialog}
          className="h-11 rounded-xl"
        >
          <PlusIcon className="size-4" />
          {t("addPlacement")}
        </Button>
      </div>

      <form action={action} className="space-y-4">
        <input
          type="hidden"
          name="placement_zones_json"
          value={JSON.stringify(zones)}
        />

        {zones.length === 0 ? (
          <div className="rounded-2xl bg-card px-5 py-10 text-center ring-1 ring-foreground/8">
            <p className="text-sm text-muted-foreground">{t("placementsEmpty")}</p>
            <Button
              type="button"
              onClick={openAddDialog}
              className="mt-4 h-11 rounded-xl"
            >
              <PlusIcon className="size-4" />
              {t("addPlacement")}
            </Button>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
            {zones.map((zone, index) => (
              <li
                key={zone.id}
                className={cn(
                  "border-b border-border last:border-b-0",
                  !zone.enabled && "bg-muted/30",
                )}
              >
                <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 sm:px-3">
                  <button
                    type="button"
                    onClick={() => openDetailDialog(zone)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium",
                          !zone.enabled && "text-muted-foreground",
                        )}
                      >
                        {zone.label_fr || zone.id}
                      </span>
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {zone.id} ·{" "}
                        {CATEGORIES.includes(
                          zone.category as (typeof CATEGORIES)[number],
                        )
                          ? t(`categoryOption.${zone.category}` as "categoryOption.top")
                          : zone.category}
                        {!zone.enabled ? ` · ${t("disabled")}` : ""}
                      </span>
                    </span>
                    <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground">
                      {t("viewDetails")}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 pr-1">
                    <label
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={zone.enabled}
                        onChange={(event) =>
                          updateZone(zone.id, {
                            enabled: event.target.checked,
                          })
                        }
                        className="size-4 rounded border"
                        aria-label={t("enabled")}
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={t("moveUp")}
                      disabled={index === 0}
                      onClick={() => moveZone(index, -1)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUpIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("moveDown")}
                      disabled={index === zones.length - 1}
                      onClick={() => moveZone(index, 1)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDownIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-foreground">{t("saved")}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={pending || zones.length === 0}
            className="h-11 rounded-xl"
          >
            {pending ? t("saving") : t("savePlacements")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openAddDialog}
            className="h-11 rounded-xl"
          >
            <PlusIcon className="size-4" />
            {t("addPlacement")}
          </Button>
        </div>
      </form>

      <form action={resetAction} className="border-t border-border pt-4">
        {resetState.error ? (
          <p className="mb-2 text-sm text-destructive">{resetState.error}</p>
        ) : null}
        <p className="mb-3 text-xs text-muted-foreground">
          {t("resetPlacementsHint")}
        </p>
        <Button
          type="submit"
          variant="ghost"
          disabled={resetPending}
          className="h-10 rounded-xl"
        >
          {resetPending ? t("saving") : t("resetPlacements")}
        </Button>
      </form>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={closeAddDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("addPlacementTitle")}</DialogTitle>
            <DialogDescription>{t("addPlacementHint")}</DialogDescription>
          </DialogHeader>

          {addDraft ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-zone-label-fr">{t("labelFr")}</Label>
                <Input
                  id="new-zone-label-fr"
                  value={addDraft.label_fr}
                  onChange={(event) => {
                    const label_fr = event.target.value;
                    setAddDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            label_fr,
                            id: uniqueId(
                              label_fr || "nouvelle_zone",
                              zones.map((z) => z.id),
                            ),
                          }
                        : prev,
                    );
                  }}
                  placeholder={t("labelFrPlaceholder")}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-zone-category">{t("category")}</Label>
                <select
                  id="new-zone-category"
                  value={addDraft.category}
                  onChange={(event) =>
                    setAddDraft((prev) =>
                      prev ? { ...prev, category: event.target.value } : prev,
                    )
                  }
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(`categoryOption.${category}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 rounded-xl bg-muted/40 p-4 ring-1 ring-foreground/8">
                <Label htmlFor="new-zone-intent">{t("intentTitle")}</Label>
                <p className="text-xs text-muted-foreground">{t("intentHint")}</p>
                <textarea
                  id="new-zone-intent"
                  value={addIntent}
                  onChange={(event) => setAddIntent(event.target.value)}
                  rows={4}
                  placeholder={t("intentPlaceholder")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  onClick={generateForAdd}
                  disabled={addGenerating || addIntent.trim().length < 3}
                  className="h-10 w-full rounded-xl sm:w-auto"
                >
                  <SparklesIcon className="size-4" />
                  {addGenerating ? t("draftAiPending") : t("draftAiGenerate")}
                </Button>
              </div>

              {addExample ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("exampleZoneTitle", { label: addExample.label_fr })}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {addExample.tryon_framing}
                  </p>
                </div>
              ) : null}

              {addDraft.tryon_framing || addAdvanced ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setAddAdvanced((v) => !v)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    {addAdvanced ? t("hideAdvanced") : t("showAdvanced")}
                  </button>
                  {addAdvanced ? (
                    <AdvancedFields
                      zone={addDraft}
                      onChange={(patch) =>
                        setAddDraft((prev) =>
                          prev ? { ...prev, ...patch } : prev,
                        )
                      }
                    />
                  ) : addDraft.tryon_framing ? (
                    <p className="rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      {t("draftAiReady")}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {addError ? (
            <p className="text-sm text-destructive">{addError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeAddDialog(false)}
              className="rounded-xl"
            >
              {t("addPlacementCancel")}
            </Button>
            <Button
              type="button"
              onClick={confirmAddZone}
              disabled={!addDraft?.tryon_framing}
              className="rounded-xl"
            >
              {t("addPlacementConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail / edit dialog */}
      <Dialog open={detailOpen} onOpenChange={closeDetailDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {detailDraft?.label_fr || t("detailPlacementTitle")}
            </DialogTitle>
            <DialogDescription>{t("detailPlacementHint")}</DialogDescription>
          </DialogHeader>

          {detailDraft ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="detail-label-fr">{t("labelFr")}</Label>
                  <Input
                    id="detail-label-fr"
                    value={detailDraft.label_fr}
                    onChange={(event) =>
                      setDetailDraft((prev) =>
                        prev
                          ? { ...prev, label_fr: event.target.value }
                          : prev,
                      )
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-label-en">{t("labelEn")}</Label>
                  <Input
                    id="detail-label-en"
                    value={detailDraft.label_en}
                    onChange={(event) =>
                      setDetailDraft((prev) =>
                        prev
                          ? { ...prev, label_en: event.target.value }
                          : prev,
                      )
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-category">{t("category")}</Label>
                  <select
                    id="detail-category"
                    value={detailDraft.category}
                    onChange={(event) =>
                      setDetailDraft((prev) =>
                        prev
                          ? { ...prev, category: event.target.value }
                          : prev,
                      )
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {t(`categoryOption.${category}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="detail-id">{t("zoneId")}</Label>
                  <Input
                    id="detail-id"
                    value={detailDraft.id}
                    onChange={(event) =>
                      setDetailDraft((prev) =>
                        prev
                          ? { ...prev, id: slugify(event.target.value) }
                          : prev,
                      )
                    }
                    className="h-10 rounded-xl font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("zoneIdHint")}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={detailDraft.enabled}
                  onChange={(event) =>
                    setDetailDraft((prev) =>
                      prev
                        ? { ...prev, enabled: event.target.checked }
                        : prev,
                    )
                  }
                  className="size-4 rounded border"
                />
                {t("enabled")}
              </label>

              <div className="space-y-2 rounded-xl bg-muted/40 p-4 ring-1 ring-foreground/8">
                <Label htmlFor="detail-intent">{t("intentTitle")}</Label>
                <p className="text-xs text-muted-foreground">{t("intentHint")}</p>
                <textarea
                  id="detail-intent"
                  value={detailIntent}
                  onChange={(event) => setDetailIntent(event.target.value)}
                  rows={3}
                  placeholder={t("intentPlaceholder")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateForDetail}
                  disabled={
                    detailGenerating || detailIntent.trim().length < 3
                  }
                  className="h-10 rounded-xl"
                >
                  <SparklesIcon className="size-4" />
                  {detailGenerating
                    ? t("draftAiPending")
                    : t("draftAiImprove")}
                </Button>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setDetailAdvanced((v) => !v)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {detailAdvanced ? t("hideAdvanced") : t("showAdvanced")}
                </button>
                {detailAdvanced ? (
                  <AdvancedFields
                    zone={detailDraft}
                    onChange={(patch) =>
                      setDetailDraft((prev) =>
                        prev ? { ...prev, ...patch } : prev,
                      )
                    }
                  />
                ) : (
                  <p className="line-clamp-3 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    {detailDraft.tryon_framing}
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {detailError ? (
            <p className="text-sm text-destructive">{detailError}</p>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={zones.length <= 1}
              onClick={removeDetailZone}
              className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2Icon className="size-4" />
              {t("removePlacement")}
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => closeDetailDialog(false)}
                className="rounded-xl"
              >
                {t("addPlacementCancel")}
              </Button>
              <Button
                type="button"
                onClick={confirmDetailZone}
                className="rounded-xl"
              >
                {t("detailPlacementApply")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdvancedFields({
  zone,
  onChange,
}: {
  zone: PlacementZoneConfig;
  onChange: (patch: Partial<PlacementZoneConfig>) => void;
}) {
  const t = useTranslations("admin.system");
  return (
    <div className="space-y-3 rounded-xl bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{t("aiTextsHint")}</p>
      <div className="space-y-1.5">
        <Label>{t("tryonFraming")}</Label>
        <textarea
          value={zone.tryon_framing}
          onChange={(event) => onChange({ tryon_framing: event.target.value })}
          rows={4}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t("packshotHint")}</Label>
        <textarea
          value={zone.packshot_hint}
          onChange={(event) => onChange({ packshot_hint: event.target.value })}
          rows={2}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t("styledClause")}</Label>
        <textarea
          value={zone.styled_clause}
          onChange={(event) => onChange({ styled_clause: event.target.value })}
          rows={2}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t("labelEn")}</Label>
        <Input
          value={zone.label_en}
          onChange={(event) => onChange({ label_en: event.target.value })}
          className="h-10 rounded-xl"
        />
      </div>
    </div>
  );
}
