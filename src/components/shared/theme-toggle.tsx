"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-xl
        text-muted-foreground hover:text-foreground hover:bg-accent
        transition-all duration-200 ease-out"
      aria-label="Alternar tema"
    >
      {isDark
        ? <Sun  className="w-4 h-4 text-yellow-400" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  )
}
