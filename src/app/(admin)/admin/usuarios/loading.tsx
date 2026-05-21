export default function UsuariosLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted/70 rounded" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-md" />
        ))}
      </div>

      {/* Search */}
      <div className="h-9 w-72 bg-muted rounded-lg" />

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="h-11 bg-muted/50 border-b border-border" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted/70 rounded flex-1" />
            <div className="h-5 w-20 bg-muted rounded-full" />
            <div className="h-4 w-20 bg-muted/60 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
