export default function ProfessorAgendaLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Page header */}
      <div className="space-y-1">
        <div className="h-7 w-24 bg-muted rounded" />
        <div className="h-4 w-40 bg-muted/70 rounded" />
      </div>

      {/* View toggle + sync buttons */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-44 bg-muted rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted rounded-md" />
          <div className="h-8 w-24 bg-muted rounded-md" />
        </div>
      </div>

      {/* Sync hint bar */}
      <div className="h-11 bg-muted rounded-xl" />

      {/* Upcoming lessons card */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="h-5 w-32 bg-muted rounded" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border">
              <div className="flex gap-3">
                <div className="w-12 space-y-1">
                  <div className="h-6 w-8 bg-muted rounded mx-auto" />
                  <div className="h-3 w-10 bg-muted/70 rounded" />
                  <div className="h-3 w-10 bg-muted/60 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted/70 rounded" />
                </div>
              </div>
              <div className="h-5 w-20 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
