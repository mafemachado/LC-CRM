"use client"

import { useState, useEffect } from "react"

export function useDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const el = document.documentElement
    const check = () => setDark(el.classList.contains("dark"))
    check()
    const observer = new MutationObserver(check)
    observer.observe(el, { attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  return dark
}

export function useChartTheme() {
  const dark = useDarkMode()
  return dark
    ? {
        bg:        "#1e1e2e",
        border:    "1px solid rgba(255,255,255,0.12)",
        labelColor:"#f3f4f6",
        itemColor: "#d1d5db",
        shadow:    "0 4px 20px rgba(0,0,0,0.5)",
        cursor:    "rgba(255,255,255,0.06)",
        tickColor: "#9ca3af",
        gridColor: "rgba(255,255,255,0.08)",
        cardBg:    "#1e1e2e",
      }
    : {
        bg:        "#ffffff",
        border:    "1px solid #e5e7eb",
        labelColor:"#111827",
        itemColor: "#374151",
        shadow:    "0 4px 16px rgba(0,0,0,0.10)",
        cursor:    "rgba(0,0,0,0.05)",
        tickColor: "#6b7280",
        gridColor: "#e5e7eb",
        cardBg:    "#ffffff",
      }
}
