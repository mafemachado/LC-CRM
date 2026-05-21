import { prisma }           from "@/lib/prisma"
import { PageHeader }       from "@/components/shared/page-header"
import { UserForm }         from "@/app/(admin)/admin/usuarios/user-form"
import { createUserAction } from "@/app/(admin)/admin/usuarios/actions"

interface NovoUsuarioColabProps {
  searchParams: Promise<{ error?: string }>
}

export default async function NovoUsuarioColabPage({ searchParams }: NovoUsuarioColabProps) {
  const { error } = await searchParams

  const guardians = await prisma.guardian.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  })

  return (
    <div>
      <PageHeader
        title="NOVO USUÁRIO"
        description="Cadastre alunos, professores, responsáveis ou colaboradores"
        backHref="/colaborador/alunos"
      />
      <UserForm
        action={createUserAction}
        error={error}
        canCreateAdmin={false}
        guardians={guardians.map((g) => ({ id: g.id, name: g.user.name }))}
      />
    </div>
  )
}
