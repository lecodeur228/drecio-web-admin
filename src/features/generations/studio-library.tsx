"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/empty-state";
import { FilterPills } from "@/components/layout/filter-pills";
import { StaggerItem, StaggerList } from "@/components/motion/presence";
import { GenerationCard } from "@/features/generations/generation-card";
import type { Generation } from "@/types/api";

type FilterId = "all" | "active" | "done" | "failed";

function matches(filter: FilterId, status: Generation["status"]) {
  if (filter === "all") return true;
  if (filter === "active") return status === "pending" || status === "processing";
  if (filter === "done") return status === "completed";
  return status === "failed";
}

export function StudioLibrary({
  generations,
  titles,
}: {
  generations: Generation[];
  titles: Record<string, string>;
}) {
  const t = useTranslations("studio");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState<FilterId>("all");

  const counts = useMemo(() => {
    const next: Record<FilterId, number> = {
      all: generations.length,
      active: 0,
      done: 0,
      failed: 0,
    };
    for (const generation of generations) {
      if (generation.status === "pending" || generation.status === "processing") {
        next.active += 1;
      } else if (generation.status === "completed") {
        next.done += 1;
      } else {
        next.failed += 1;
      }
    }
    return next;
  }, [generations]);

  const visible = useMemo(
    () => generations.filter((generation) => matches(filter, generation.status)),
    [filter, generations],
  );

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "active", label: t("filterActive") },
    { id: "done", label: t("filterDone") },
    { id: "failed", label: t("filterFailed") },
  ];

  return (
    <div className="space-y-5">
      <FilterPills
        items={filters.map((item) => ({
          ...item,
          count: counts[item.id],
        }))}
        value={filter}
        onChange={setFilter}
      />

      {visible.length === 0 ? (
        <EmptyState
          title={t("emptyFilterTitle")}
          description={t("emptyFilterDescription")}
          actionHref="/articles/new"
          actionLabel={tCommon("newArticle")}
        />
      ) : (
        <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((generation) => (
            <StaggerItem key={generation.id}>
              <GenerationCard
                generation={generation}
                title={titles[generation.article_id]}
              />
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
