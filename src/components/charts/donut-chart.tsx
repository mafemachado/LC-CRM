"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface DonutChartProps {
  data:    { label: string; value: number; color: string }[]
  height?: number
  inner?:  number
  outer?:  number
}

export function DonutChart({ data, height = 200, inner = 55, outer = 80 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="50%"
          innerRadius={inner} outerRadius={outer}
          dataKey="value" paddingAngle={2}
          nameKey="label"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          formatter={(v) => { const n = Number(v ?? 0); return [`${n} (${total ? Math.round(n/total*100) : 0}%)`, ""] }}
        />
        <Legend
          iconType="circle" iconSize={8}
          formatter={(value) => <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
