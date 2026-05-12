import { BookOpen } from "lucide-react"
import Link from "next/link"

export function NavLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 px-2 py-1 select-none">
      <div className="w-9 h-9 shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-sm">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      {!collapsed && (
        <span className="font-heading text-lg text-foreground leading-none">
          LIÇÃO DE CASA
        </span>
      )}
    </Link>
  )
}
