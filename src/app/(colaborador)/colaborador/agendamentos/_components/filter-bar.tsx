"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition }              from "react"
import { SlidersHorizontal, X }      from "lucide-react"

interface FilterBarProps {
  teachers: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
}

const selectCls =
  "h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground " +
  "cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring transition-colors min-w-[160px]"

const dateCls =
  "h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground " +
  "focus:outline-none focus:ring-1 focus:ring-ring transition-colors w-[136px]"

export function FilterBar({ teachers, subjects }: FilterBarProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    startTransition(() => router.replace(`?${next.toString()}`))
  }

  const hasFilters =
    params.has("teacher") || params.has("subject") ||
    params.has("dateFrom") || params.has("dateTo")

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
      <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

      <select
        className={selectCls}
        value={params.get("teacher") ?? ""}
        onChange={(e) => update("teacher", e.target.value || null)}
      >
        <option value="">Todos os professores</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select
        className={selectCls}
        value={params.get("subject") ?? ""}
        onChange={(e) => update("subject", e.target.value || null)}
      >
        <option value="">Todas as matérias</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">De</span>
        <input
          type="date"
          className={dateCls}
          value={params.get("dateFrom") ?? ""}
          onChange={(e) => update("dateFrom", e.target.value || null)}
        />
        <span className="text-xs text-muted-foreground">até</span>
        <input
          type="date"
          className={dateCls}
          value={params.get("dateTo") ?? ""}
          onChange={(e) => update("dateTo", e.target.value || null)}
        />
      </div>

      {hasFilters && (
        <button
          className="flex items-center gap-1 h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          onClick={() => startTransition(() => router.replace("?"))}
        >
          <X className="w-3 h-3" /> Limpar filtros
        </button>
      )}
    </div>
  )
}
