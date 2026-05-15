"use client"

import { useState, useEffect } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "@/hooks/use-dark-mode"

interface AreaChartProps {
  data:         { label: string; value: number }[]
  color?:       string
  valuePrefix?: string
  height?:      number
}

export function SimpleAreaChart({
  data, color = "#FB8500", valuePrefix = "", height = 200,
}: AreaChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const t = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: t.tickColor }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: t.tickColor }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => `${valuePrefix}${v}`}
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
          labelStyle={{ color: t.labelColor, fontWeight: 600, marginBottom: 2 }}
          itemStyle={{ color: t.itemColor }}
          formatter={(v) => [`${valuePrefix}${Number(v ?? 0).toLocaleString("pt-BR")}`, ""]}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 2" }}
          animationDuration={150}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#grad-${color.replace("#","")})`}
          dot={{ r: 3.5, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: t.cardBg }}
          isAnimationActive={mounted}
          animationDuration={1200}
          animationEasing="ease-out"
          animationBegin={0}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
