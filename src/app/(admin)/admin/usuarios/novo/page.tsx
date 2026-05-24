import { prisma }        from "@/lib/prisma"
import { PageHeader }    from "@/components/shared/page-header"
import { CreateUserForm } from "./create-user-form"

export default async function NovoUsuarioPage() {
  const [guardians, studentsWithoutGuardian] = await Promise.all([
    prisma.guardian.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.student.findMany({
      where:   { guardianId: null },
      select:  { id: true, name: true, grade: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div>
      <PageHeader
        title="NOVO USUÁRIO"
        description="Preencha os dados para criar um novo usuário"
        backHref="/admin/usuarios"
      />
      <CreateUserForm
        guardians={guardians.map((g) => ({ id: g.id, name: g.user.name }))}
        students={studentsWithoutGuardian.map((s) => ({ id: s.id, name: s.name, grade: s.grade }))}
      />
    </div>
  )
}
