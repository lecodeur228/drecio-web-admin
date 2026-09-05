"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { RodiumModelItem } from "@/types/admin";

export function ModelSearchSelect({
  id,
  name,
  label,
  value,
  options,
  emptyHint,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: RodiumModelItem[];
  emptyHint?: string;
}) {
  const t = useTranslations("admin.system");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(value);

  const filtered = useMemo(() => {
    const list = options ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        (item.owned_by?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-search`}>{label}</Label>
      <input type="hidden" name={name} value={selected} />
      <p className="rounded-xl bg-muted/60 px-3 py-2 font-mono text-xs break-all">
        {selected || t("modelNone")}
      </p>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={`${id}-search`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("modelSearch")}
          className="h-11 rounded-xl pl-9"
        />
      </div>
      <ul className="max-h-56 overflow-y-auto rounded-2xl bg-card ring-1 ring-foreground/8">
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-sm text-muted-foreground">
            {emptyHint || t("modelEmpty")}
          </li>
        ) : (
          filtered.map((item) => {
            const active = item.id === selected;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-muted/60",
                    active && "bg-muted",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs">{item.id}</span>
                    {item.owned_by ? (
                      <span className="text-xs text-muted-foreground">{item.owned_by}</span>
                    ) : null}
                  </span>
                  {active ? <CheckIcon className="size-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
