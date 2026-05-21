import { Monitor, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Portado de design_handoff_lc_crm/shared.jsx linhas ~190–220.
// Ícones Lucide substituem os SVGs inline do protótipo (conforme iconografia do README).

type Modo = "online" | "sede"
type BadgeSize = "sm" | "md" | "lg"

interface SizeConfig {
  text: string
  py: string
  px: string
  iconSize: number
}

const SIZE_CONFIG: Record<BadgeSize, SizeConfig> = {
  sm: { text: "text-[10.5px]", py: "py-0.5",   px: "px-1.5",  iconSize: 10 },
  md: { text: "text-[11px]",   py: "py-[3px]", px: "px-2",    iconSize: 11 },
  lg: { text: "text-[12px]",   py: "py-1",     px: "px-2.5",  iconSize: 12 },
}

interface ModoBadgeProps {
  modo: Modo
  size?: BadgeSize
  className?: string
}

export function ModoBadge({ modo, size = "sm", className }: ModoBadgeProps) {
  const isOnline = modo === "online"
  const { text, py, px, iconSize } = SIZE_CONFIG[size]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded font-mono font-semibold leading-none whitespace-nowrap",
        text,
        py,
        px,
        isOnline
          ? "bg-[var(--info-soft)] text-[var(--info)]"
          : "bg-[var(--muted-soft)] text-[var(--text-2)]",
        className
      )}
    >
      {isOnline ? (
        <Monitor size={iconSize} strokeWidth={2} />
      ) : (
        <Building2 size={iconSize} strokeWidth={2} />
      )}
      {isOnline ? "Online" : "Sede"}
    </span>
  )
}
