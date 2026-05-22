"use client"

import Link            from "next/link"
import { usePathname } from "next/navigation"
import { format }      from "date-fns"
import { cn }          from "@/lib/utils"
import { NAV_ITEMS }   from "./nav-items"
import type { Role }   from "@prisma/client"

interface SidebarNavProps {
  role:        Role
  onNavigate?: () => void
}

const TODAY_AGENDA_HREFS = new Set([
  "/colaborador/agenda",
  "/admin/agenda",
])

export function SidebarNav({ role, onNavigate }: SidebarNavProps) {
  const pathname  = usePathname()
  const items     = NAV_ITEMS[role] ?? []
  const todayStr  = format(new Date(), "yyyy-MM-dd")

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map(({ label, href, icon: Icon }) => {
        const resolvedHref = TODAY_AGENDA_HREFS.has(href)
          ? `${href}?date=${todayStr}&view=day`
          : href
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={resolvedHref}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
