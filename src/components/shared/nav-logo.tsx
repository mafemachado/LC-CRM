import Image from "next/image"
import Link  from "next/link"

export function NavLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 px-2 py-1 select-none group">
      <div className="w-9 h-9 shrink-0 rounded-xl overflow-hidden shadow-sm
        transition-transform duration-200 group-hover:scale-105">
        <Image src="/logo.svg" alt="Lição de Casa" width={36} height={36} priority />
      </div>
      {!collapsed && (
        <span className="font-heading text-lg text-foreground leading-none">
          LIÇÃO DE CASA
        </span>
      )}
    </Link>
  )
}
