export default function AdminAgendaLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Page header */}
      <div className="space-y-1">
        <div className="h-7 w-24 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted/70 rounded" />
      </div>

      {/* Day starter banner placeholder */}
      <div className="h-14 bg-muted rounded-xl" />

      {/* View + date nav bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <div className="h-9 w-16 bg-muted rounded-lg" />
          <div className="h-9 w-20 bg-muted rounded-lg" />
          <div className="h-9 w-20 bg-muted rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-muted rounded-lg" />
          <div className="h-9 w-32 bg-muted rounded-lg" />
          <div className="h-9 w-9 bg-muted rounded-lg" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-lg" />
      </div>

      {/* Agenda grid — teacher columns */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid border-b bg-muted/30" style={{ gridTemplateColumns: "64px repeat(4, 1fr)" }}>
          <div className="h-12" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 border-l border-border flex items-center justify-center px-3">
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="grid border-b border-border/50 last:border-0" style={{ gridTemplateColumns: "64px repeat(4, 1fr)", height: "64px" }}>
            <div className="flex items-start justify-end pr-2 pt-1">
              <div className="h-3 w-8 bg-muted/60 rounded" />
            </div>
            {Array.from({ length: 4 }).map((_, col) => (
              <div key={col} className="border-l border-border/40 p-1">
                {row === 2 && col === 1 && <div className="h-12 bg-primary/20 rounded-md" />}
                {row === 4 && col === 3 && <div className="h-12 bg-blue-400/20 rounded-md" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
