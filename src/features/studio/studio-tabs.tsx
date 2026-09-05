"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/empty-state";
import { ArticleCard } from "@/features/articles/article-card";
import { StudioLibrary } from "@/features/generations/studio-library";
import { cn } from "@/lib/utils";
import type { Article, Generation } from "@/types/api";

type TabId = "articles" | "visuels";

function isValidTab(value: string | null): value is TabId {
  return value === "articles" || value === "visuels";
}

export function StudioTabs({
  articles,
  generations,
  titles,
  defaultTab = "visuels",
}: {
  articles: Article[];
  generations: Generation[];
  titles: Record<string, string>;
  defaultTab?: TabId;
}) {
  const t = useTranslations("studio");
  const tEmpty = useTranslations("empty");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTab = searchParams.get("tab");

  const [tab, setTab] = useState<TabId>(
    isValidTab(paramTab) ? paramTab : defaultTab,
  );

  const switchTab = useCallback(
    (next: TabId) => {
      setTab(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const articleCount = articles.length;
  const generationCount = generations.length;

  const counts = useMemo<Record<TabId, number>>(
    () => ({ articles: articleCount, visuels: generationCount }),
    [articleCount, generationCount],
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "articles", label: t("tabArticles") },
    { id: "visuels", label: t("tabVisuals") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => switchTab(item.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {counts[item.id] > 0 && (
              <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                {counts[item.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "articles" && (
        <>
          {articles.length === 0 ? (
            <EmptyState
              title={tEmpty("noArticleTitle")}
              description={tEmpty("noArticleDescription")}
              actionHref="/articles/new"
              actionLabel={tCommon("newArticle")}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "visuels" && (
        <>
          {generations.length === 0 ? (
            <EmptyState
              title={tEmpty("noVisualTitle")}
              description={tEmpty("noVisualDescription")}
              actionHref="/articles/new"
              actionLabel={tCommon("newArticle")}
            />
          ) : (
            <StudioLibrary generations={generations} titles={titles} />
          )}
        </>
      )}
    </div>
  );
}
