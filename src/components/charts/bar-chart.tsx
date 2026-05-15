"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import { useChartTheme } from "@/hooks/use-dark-mode"

interface BarChartProps {
  data:         { label: string; value: number; color?: string }[]
  color?:       string
  valuePrefix?: string
  height?:      number
  horizontal?:  boolean
}

export function SimpleBarChart({
  data, color = "#FB8500", valuePrefix = "", height = 200, horizontal = false,
}: BarChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const t = useChartTheme()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 4, left: horizontal ? 60 : -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={t.gridColor}
          horizontal={!horizontal}
          vertical={horizontal}
        />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: t.tickColor }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${valuePrefix}${v}`}
            />
            <YAxis
              type="category" dataKey="label" width={56}
              tick={{ fontSize: 11, fill: t.tickColor }}
              axisLine={false} tickLine={false}
            />
          </>
        ) : (
          <>
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
          </>
        )}
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
          cursor={{ fill: t.cursor, radius: 4 }}
          animationDuration={150}
        />
        <Bar
          dataKey="value"
          radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
          maxBarSize={48}
          isAnimationActive={mounted}
          animationDuration={700}
          animationEasing="ease-out"
          animationBegin={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
