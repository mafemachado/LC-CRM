import { Skeleton } from "@/components/ui/skeleton"

export default function StudentDetailLoading() {
  return (
    <div className="space-y-4">

      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-4">

          {/* Package timeline */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-64" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-lg" />
              ))}
            </div>
            <div className="flex gap-6 pt-2 border-t border-border/50">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Lesson history */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-40" />
            </div>

            {/* Heatmap skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-48" />
              <div className="flex gap-1">
                {Array.from({ length: 13 }).map((_, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, di) => (
                      <Skeleton key={di} className="w-3 h-3 rounded-sm" />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border pb-3">
              <Skeleton className="h-6 w-14 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-14 rounded-lg" />
            </div>

            {/* Table rows */}
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24 hidden sm:block" />
                  <Skeleton className="h-4 w-32 hidden md:block" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          {/* Financeiro */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>

          {/* Professores */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>

          {/* Observações */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
