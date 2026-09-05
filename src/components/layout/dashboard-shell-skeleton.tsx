import { Skeleton } from "@/components/ui/skeleton";

export function DashboardShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar sm:block">
        <div className="space-y-6 p-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-32" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="mt-auto p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <header className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Skeleton className="size-7 rounded-full sm:hidden" />
          <div className="flex-1" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </header>

        {/* Content skeleton */}
        <div className="w-full flex-1 px-4 py-8 md:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
