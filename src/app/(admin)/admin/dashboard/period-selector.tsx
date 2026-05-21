"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const PERIODOS = [
  { id: "mes",          label: "Este mês"    },
  { id: "mes-anterior", label: "Mês anterior" },
  { id: "3meses",       label: "3 meses"     },
  { id: "6meses",       label: "6 meses"     },
  { id: "ano",          label: "Este ano"    },
] as const

type Periodo = typeof PERIODOS[number]["id"]

export function PeriodSelector({ current }: { current: Periodo }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState<Periodo | null>(null)

  const active = optimistic ?? current

  function handleClick(id: Periodo) {
    if (id === active && !isPending) return
    setOptimistic(id)
    startTransition(() => {
      router.push(`?periodo=${id}`)
    })
  }

  return (
    <div className="flex items-center gap-[3px] self-start rounded-[9px] border border-border bg-card p-[3px]">
      {PERIODOS.map((p) => {
        const isActive = active === p.id
        const isLoading = isPending && optimistic === p.id
        return (
          <button
            key={p.id}
            onClick={() => handleClick(p.id)}
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[6px] px-[11px] py-[5px] text-[12px] font-medium transition-colors",
              isActive
                ? "text-white shadow-sm"
                : "text-muted-foreground hover:bg-[var(--hover)] hover:text-[var(--text)]",
              isPending && !isActive && "opacity-50"
            )}
            style={isActive ? { background: "var(--primary)" } : {}}
          >
            {isLoading && (
              <svg
                className="h-3 w-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
