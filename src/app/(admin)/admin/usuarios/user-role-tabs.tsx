"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserRoleTabsProps {
  counts: Record<string, number>
  total:  number
}

const ROLE_TABS = [
  { label: "Todos",         value: ""             },
  { label: "Admins",        value: "ADMIN"        },
  { label: "Colaboradores", value: "COLLABORATOR" },
  { label: "Professores",   value: "TEACHER"      },
  { label: "Alunos",        value: "STUDENT"      },
  { label: "Responsáveis",  value: "GUARDIAN"     },
]

export function UserRoleTabs({ counts, total }: UserRoleTabsProps) {
  const router               = useRouter()
  const searchParams         = useSearchParams()
  const current              = searchParams.get("role") ?? ""
  const q                    = searchParams.get("q")
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams()
    if (value) params.set("role", value)
    if (q)     params.set("q", q)
    startTransition(() => {
      router.push(`/admin/usuarios${params.size ? `?${params}` : ""}`)
    })
  }

  return (
    <div className="relative mb-4">
      <Tabs value={current} onValueChange={handleChange}>
        <TabsList className={cn("h-auto flex-wrap gap-1 bg-muted p-1 transition-opacity", isPending && "opacity-60 pointer-events-none")}>
          {ROLE_TABS.map(({ label, value }) => (
            <TabsTrigger key={value} value={value} className="text-xs px-3 py-1">
              {label}
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                ({value ? (counts[value] ?? 0) : total})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isPending && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Carregando…
        </div>
      )}
    </div>
  )
}
