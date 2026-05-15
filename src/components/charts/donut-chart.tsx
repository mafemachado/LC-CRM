"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useChartTheme } from "@/hooks/use-dark-mode"

interface DonutChartProps {
  data:    { label: string; value: number; color: string }[]
  height?: number
  inner?:  number
  outer?:  number
}

export function DonutChart({ data, height = 200, inner = 58, outer = 85 }: DonutChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const t = useChartTheme()
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="45%"
          innerRadius={inner}
          outerRadius={outer}
          dataKey="value"
          nameKey="label"
          paddingAngle={3}
          isAnimationActive={mounted}
          animationBegin={0}
          animationDuration={900}
          animationEasing="ease-out"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background:   t.bg,
            border:       t.border,
            borderRadius: 10,
            fontSize:     12,
            color:        t.labelColor,
            boxShadow:    t.shadow,
          }}
          labelStyle={{ color: t.labelColor, fontWeight: 600, marginBottom: 2 }}
          itemStyle={{ color: t.itemColor }}
          formatter={(v) => {
            const n = Number(v ?? 0)
            return [`${n} (${total ? Math.round(n / total * 100) : 0}%)`, ""]
          }}
          animationDuration={150}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
          formatter={(value) => (
            <span style={{ color: t.tickColor }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
