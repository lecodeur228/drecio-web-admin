import { Skeleton } from "@/components/ui/skeleton";

export function FinanceSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>

      <Skeleton className="h-11 w-64 rounded-2xl" />

      <div className="overflow-hidden rounded-3xl ring-1 ring-foreground/8">
        <div className="grid lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3 border-b border-border px-6 py-7 lg:border-r lg:border-b-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="grid grid-cols-3 divide-x divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 px-4 py-5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="h-16 w-full rounded-2xl" />

      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="overflow-hidden rounded-3xl ring-1 ring-foreground/8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
