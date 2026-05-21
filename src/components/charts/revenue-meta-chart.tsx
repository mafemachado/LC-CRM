"use client"

import { useState, useEffect } from "react"
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "@/hooks/use-dark-mode"

interface Props {
  data: { m: string; v: number; meta: number }[]
}

function brlK(v: number) {
  if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`
  return `R$${v}`
}

function brlFmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

export function RevenueMetaChart({ data }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const t = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="opsRevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="2 3" stroke={t.gridColor} vertical={false} />

        <XAxis
          dataKey="m"
          tick={{ fontSize: 10, fill: t.tickColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: t.tickColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={brlK}
        />

        <Tooltip
          contentStyle={{
            background:   t.bg,
            border:       t.border,
            borderRadius: 10,
            fontSize:     12,
            color:        t.labelColor,
            boxShadow:    t.shadow,
          }}
          labelStyle={{ color: t.labelColor, fontWeight: 600, marginBottom: 4 }}
          formatter={(v: unknown, name: unknown) => [
            brlFmt(Number(v)),
            name === "v" ? "Receita" : "Meta",
          ]}
          cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 2" }}
          animationDuration={150}
        />

        <Area
          type="monotone"
          dataKey="v"
          stroke="var(--primary)"
          strokeWidth={1.8}
          fill="url(#opsRevGrad)"
          dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
          activeDot={{ r: 4.5, fill: "var(--primary)", strokeWidth: 2, stroke: t.cardBg }}
          isAnimationActive={mounted}
          animationDuration={1200}
          animationEasing="ease-out"
        />

        <Line
          type="monotone"
          dataKey="meta"
          stroke={t.tickColor}
          strokeWidth={1.2}
          strokeDasharray="3 3"
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
