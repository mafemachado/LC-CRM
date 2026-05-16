"use client"

import Link                                        from "next/link"
import { Avatar, AvatarFallback, AvatarImage }     from "@/components/ui/avatar"
import { ChevronRight }                            from "lucide-react"

const ROLE_LABEL: Record<string, string> = {
  ADMIN:        "Administrador",
  COLLABORATOR: "Colaborador",
  TEACHER:      "Professor",
  STUDENT:      "Aluno",
  GUARDIAN:     "Responsável",
}

const ROLE_PROFILE: Record<string, string> = {
  ADMIN:        "/admin/perfil",
  COLLABORATOR: "/colaborador/perfil",
  TEACHER:      "/professor/perfil",
  STUDENT:      "/aluno/perfil",
  GUARDIAN:     "/aluno/perfil",
}

interface UserMenuProps {
  name:          string
  email:         string
  role:          string
  image?:        string | null
  phone?:        string | null
  onBeforeOpen?: () => void
}

export function UserMenu({ name, role, image, onBeforeOpen }: UserMenuProps) {
  const href     = ROLE_PROFILE[role] ?? "/login"
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Link
      href={href}
      onClick={onBeforeOpen}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={image ?? undefined} alt={name} />
        <AvatarFallback className="bg-primary text-white text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{ROLE_LABEL[role]}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </Link>
  )
}
