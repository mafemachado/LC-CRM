import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Sparkline ────────────────────────────────────────────────────────────────

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
}

export function Sparkline({
  data,
  color = "var(--primary)",
  height = 26,
  width = 92,
}: SparklineProps) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i): [number, number] => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 4) - 2,
  ])
  const d = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")
  const area = `${d} L${width},${height} L0,${height} Z`
  const [lx, ly] = pts[pts.length - 1]

  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <path d={area} fill={color} opacity={0.1} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lx} cy={ly} r={2.5} fill={color} />
    </svg>
  )
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

type DeltaVariant = "success" | "danger" | "warn" | "muted"

interface KpiCardProps extends React.ComponentProps<"div"> {
  label: string
  value: string | number
  delta?: string
  deltaVariant?: DeltaVariant
  sparklineData?: number[]
  sparklineColor?: string
}

const DELTA_CLASSES: Record<DeltaVariant, string> = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  danger:  "bg-[var(--danger-soft)]  text-[var(--danger)]",
  warn:    "bg-[var(--warn-soft)]    text-[var(--warn)]",
  muted:   "bg-[var(--muted-soft)]   text-muted-foreground",
}

export function KpiCard({
  label,
  value,
  delta,
  deltaVariant = "muted",
  sparklineData,
  sparklineColor,
  className,
  children,
  ...props
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[10px] bg-card border border-border overflow-hidden p-4",
        className
      )}
      {...props}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground leading-none">
        {label}
      </span>

      <div className="flex items-end justify-between gap-3">
        <span
          className="font-mono text-[28px] font-semibold leading-none tracking-[-0.02em]"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {value}
        </span>

        {delta && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold leading-none",
              DELTA_CLASSES[deltaVariant]
            )}
          >
            {delta}
          </span>
        )}
      </div>

      {sparklineData && (
        <Sparkline data={sparklineData} color={sparklineColor ?? "var(--primary)"} />
      )}

      {children}
    </div>
  )
}
