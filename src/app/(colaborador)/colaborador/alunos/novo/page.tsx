import { PageHeader }    from "@/components/shared/page-header"
import { AlertCircle }   from "lucide-react"
import { prisma }        from "@/lib/prisma"
import { NovoAlunoForm } from "./_components/novo-aluno-form"

interface NovoAlunoPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function NovoAlunoPage({ searchParams }: NovoAlunoPageProps) {
  const { error } = await searchParams

  const [teachers, subjects] = await Promise.all([
    prisma.teacher.findMany({
      where:   { user: { active: true } },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const teacherList = teachers.map(t => ({ id: t.id, name: t.user.name }))
  const subjectList = subjects.map(s => ({ id: s.id, name: s.name }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="NOVO ALUNO"
        description="Cadastre um aluno ou digitalize uma ficha física"
        backHref="/colaborador/alunos"
      />

      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {decodeURIComponent(error)}
        </div>
      )}

      <NovoAlunoForm teachers={teacherList} subjects={subjectList} />
    </div>
  )
}
