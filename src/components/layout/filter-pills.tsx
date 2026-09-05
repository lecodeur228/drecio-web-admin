"use client";

import { cn } from "@/lib/utils";

export type FilterPill<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

export function FilterPills<T extends string>({
  items,
  value,
  onChange,
}: {
  items: FilterPill<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span className={cn("tabular-nums", active ? "opacity-90" : "opacity-70")}>
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
