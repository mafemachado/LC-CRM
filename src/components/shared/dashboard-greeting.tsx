"use client"

import { useState, useEffect } from "react"
import { format }              from "date-fns"
import { ptBR }                from "date-fns/locale"

function getSaudacao(hour: number): string {
  if (hour >= 5 && hour < 12) return "Bom dia"
  if (hour >= 12 && hour < 18) return "Boa tarde"
  return "Boa noite"
}

interface DashboardGreetingProps {
  firstName: string
  subtitle?: string
}

export function DashboardGreeting({ firstName, subtitle }: DashboardGreetingProps) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const hour     = now?.getHours() ?? new Date().getHours()
  const saudacao = getSaudacao(hour)
  const rawDate  = now ? format(now, "EEEE · dd 'de' MMMM", { locale: ptBR }) : ""
  const dateLabel = rawDate ? rawDate.charAt(0).toUpperCase() + rawDate.slice(1) : ""

  return (
    <div>
      {dateLabel && (
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          {dateLabel}
        </p>
      )}
      <h1 className="font-sub text-[22px] font-semibold leading-tight tracking-[-0.02em]">
        {saudacao}, {firstName}
        {subtitle ? (
          <>
            {". "}
            <span className="text-muted-foreground">{subtitle}</span>
          </>
        ) : "."}
      </h1>
    </div>
  )
}
