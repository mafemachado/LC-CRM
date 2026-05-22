import { Skeleton } from "@/components/ui/skeleton"

export default function AlunosLoading() {
  return (
    <div className="space-y-4">

      {/* Toolbar skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 flex-1 min-w-[180px] rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-44 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Board columns skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, ci) => (
          <div key={ci} className="flex flex-col gap-3">
            {/* Column header */}
            <div className="rounded-xl border border-border/50 px-4 py-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
              {Array.from({ length: ci === 0 ? 3 : ci === 1 ? 2 : ci === 2 ? 4 : 1 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
