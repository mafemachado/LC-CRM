import { prisma }         from "@/lib/prisma"
import { PageHeader }     from "@/components/shared/page-header"
import { CreateUserForm } from "@/app/(admin)/admin/usuarios/novo/create-user-form"

export default async function NovoUsuarioColabPage() {
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
      <CreateUserForm
        canCreateAdmin={false}
        guardians={guardians.map((g) => ({ id: g.id, name: g.user.name }))}
        students={[]}
      />
    </div>
  )
}
