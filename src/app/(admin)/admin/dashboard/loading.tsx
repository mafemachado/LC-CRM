export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-[18px] animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-40 rounded bg-muted" />
            <div className="h-6 w-56 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted/70" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-8 w-24 rounded-[6px] bg-muted" />
            <div className="h-8 w-24 rounded-[6px] bg-muted" />
          </div>
        </div>
        {/* Seletor de período */}
        <div className="h-9 w-72 rounded-[9px] bg-muted" />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-border lg:grid-cols-4" style={{ gap: "1px", background: "var(--border)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 bg-card p-[14px_16px_12px]">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="h-7 w-20 rounded bg-muted" />
            <div className="h-2.5 w-36 rounded bg-muted/70" />
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {/* Left */}
        <div className="flex flex-col gap-4">
          <div className="h-72 rounded-[10px] bg-muted" />
          <div className="h-52 rounded-[10px] bg-muted" />
        </div>
        {/* Right */}
        <div className="flex flex-col gap-4">
          <div className="h-40 rounded-[10px] bg-muted" />
          <div className="h-52 rounded-[10px] bg-muted" />
        </div>
      </div>
    </div>
  )
}
