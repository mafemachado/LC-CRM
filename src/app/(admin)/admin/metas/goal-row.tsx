"use client"

import { useRef, useState, useTransition } from "react"
import { upsertMonthlyGoal }               from "@/lib/actions/goals"

interface GoalRowProps {
  year:         number
  month:        number
  monthLabel:   string
  revenueGoal:  number | null
  lessonsGoal:  number | null
  studentsGoal: number | null
  isFuture:     boolean
}

function NumInput({
  name, defaultValue, placeholder,
}: {
  name: string; defaultValue: number | null; placeholder: string
}) {
  return (
    <input
      name={name}
      type="number"
      min={0}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      className="w-full rounded-[6px] border border-border bg-background px-2 py-1.5 text-right text-[13px] tabular-nums focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder:text-muted-foreground/50"
    />
  )
}

export function GoalRow({
  year, month, monthLabel,
  revenueGoal, lessonsGoal, studentsGoal,
  isFuture,
}: GoalRowProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const res = await upsertMonthlyGoal(fd)
      if (res.error) { setError(res.error) }
      else            { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="year"  value={year}  />
      <input type="hidden" name="month" value={month} />

      <div
        className="grid items-center gap-3 px-4 py-3 text-[13px] hover:bg-muted/30 transition-colors"
        style={{ gridTemplateColumns: "110px 1fr 1fr 1fr 90px" }}
      >
        {/* Mês */}
        <span className={`font-medium capitalize ${isFuture ? "text-muted-foreground" : ""}`}>
          {monthLabel}
        </span>

        {/* Receita */}
        <NumInput name="revenueGoal"  defaultValue={revenueGoal}  placeholder="ex: 5000" />

        {/* Aulas */}
        <NumInput name="lessonsGoal"  defaultValue={lessonsGoal}  placeholder="ex: 40"   />

        {/* Alunos */}
        <NumInput name="studentsGoal" defaultValue={studentsGoal} placeholder="ex: 20"   />

        {/* Ação */}
        <div className="flex items-center justify-end gap-2">
          {saved && <span className="text-[11px] text-[var(--success)]">Salvo</span>}
          {error && <span className="text-[11px] text-[var(--danger)]">{error}</span>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-[6px] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            {pending ? "…" : "Salvar"}
          </button>
        </div>
      </div>
    </form>
  )
}
