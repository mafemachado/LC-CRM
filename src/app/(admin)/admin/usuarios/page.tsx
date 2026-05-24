import { auth }          from "@/lib/auth"
import { prisma }        from "@/lib/prisma"
import { Button }        from "@/components/ui/button"
import { Input }         from "@/components/ui/input"
import { Card }          from "@/components/ui/card"
import { PageHeader }    from "@/components/shared/page-header"
import { LinkButton }    from "@/components/shared/link-button"
import { UserRoleTabs }  from "./user-role-tabs"
import { UsersTable }    from "./users-table"
import { UserPlus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Suspense }      from "react"
import type { Role }     from "@prisma/client"

const ROLE_FILTER: Record<string, Role | undefined> = {
  ADMIN: "ADMIN", COLLABORATOR: "COLLABORATOR",
  TEACHER: "TEACHER", STUDENT: "STUDENT", GUARDIAN: "GUARDIAN",
}

const PAGE_SIZE = 20

interface UsuariosPageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string; success?: string; error?: string }>
}

function buildQuery(opts: { q?: string; role?: string; page?: number }) {
  const p = new URLSearchParams()
  if (opts.role) p.set("role", opts.role)
  if (opts.q)   p.set("q", opts.q)
  if (opts.page && opts.page > 1) p.set("page", String(opts.page))
  return p.toString()
}

export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const { q, role, page: pageParam, success, error } = await searchParams
  const session    = await auth()
  const currentId  = session?.user?.id ?? ""
  const roleFilter = role ? ROLE_FILTER[role] : undefined
  const page       = Math.max(1, parseInt(pageParam ?? "1", 10))
  const skip       = (page - 1) * PAGE_SIZE

  const where = {
    ...(roleFilter && { role: roleFilter }),
    ...(q && {
      OR: [
        { name:  { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  }

  const [users, counts, filteredCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.user.count({ where }),
  ])

  const countMap   = Object.fromEntries(counts.map((c) => [c.role, c._count]))
  const total      = counts.reduce((sum, c) => sum + c._count, 0)
  const totalPages = Math.ceil(filteredCount / PAGE_SIZE)

  return (
    <div>
      <PageHeader title="USUÁRIOS" description="Gerencie todos os usuários do sistema">
        <LinkButton href="/admin/usuarios/novo">
          <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
        </LinkButton>
      </PageHeader>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {decodeURIComponent(success)}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Filtros de role — tabs */}
      <Suspense>
        <UserRoleTabs counts={countMap} total={total} />
      </Suspense>

      {/* Busca */}
      <form className="mb-4 flex gap-2 max-w-sm">
        {role && <input type="hidden" name="role" value={role} />}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            name="q" defaultValue={q}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9 h-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">Buscar</Button>
      </form>

      {/* Tabela */}
      <Card>
        <UsersTable users={users} currentId={currentId} />

        {/* Paginação */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
          <span>
            {filteredCount === 0
              ? "Nenhum usuário"
              : `${skip + 1}–${Math.min(skip + PAGE_SIZE, filteredCount)} de ${filteredCount} usuário${filteredCount !== 1 ? "s" : ""}`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <LinkButton
                  href={`/admin/usuarios?${buildQuery({ q, role, page: page - 1 })}`}
                  variant="outline" size="icon" className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </LinkButton>
              ) : (
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <span className="px-3 text-xs">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <LinkButton
                  href={`/admin/usuarios?${buildQuery({ q, role, page: page + 1 })}`}
                  variant="outline" size="icon" className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </LinkButton>
              ) : (
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
