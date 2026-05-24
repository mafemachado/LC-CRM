import { prisma }        from "@/lib/prisma"
import { PageHeader }    from "@/components/shared/page-header"
import { StudentsBoard } from "@/app/(colaborador)/colaborador/alunos/_components/students-board"
import type { StudentRow } from "@/app/(colaborador)/colaborador/alunos/_components/student-board-card"

export default async function AdminAlunosPage() {
  const [students, subjectRows] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: true,
        guardian: { include: { user: true } },
        packages: {
          where:   { status: { in: ["ACTIVE", "EXHAUSTED"] } },
          orderBy: { purchaseDate: "desc" },
          take:    1,
        },
        participations: {
          where:   { lesson: { scheduledAt: { gte: new Date() }, status: { in: ["SCHEDULED", "CONFIRMED"] } } },
          orderBy: { lesson: { scheduledAt: "asc" } },
          take:    1,
          include: { lesson: { include: { subject: true } } },
        },
        payments: {
          orderBy: { dueDate: "desc" },
          take:    1,
        },
        _count: {
          select: {
            packages:       true,
            participations: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const serialized: StudentRow[] = students.map(s => ({
    ...s,
    packages:       s.packages.map(p => ({ ...p, pricePerLesson: Number(p.pricePerLesson) })),
    payments:       s.payments.map(p => ({ ...p, amount: Number(p.amount) })),
    participations: s.participations.map(part => ({
      ...part,
      lesson: {
        ...part.lesson,
        priceOverride: part.lesson.priceOverride != null ? Number(part.lesson.priceOverride) : null,
      },
    })),
  })) as unknown as StudentRow[]

  const grades   = [...new Set(students.map(s => s.grade).filter(Boolean))].sort() as string[]
  const subjects = subjectRows.map(s => s.name)

  return (
    <div className="space-y-6">
      <PageHeader
        title="ALUNOS"
        description={`${students.length} aluno${students.length !== 1 ? "s" : ""} cadastrado${students.length !== 1 ? "s" : ""}`}
      />

      <StudentsBoard
        students={serialized}
        grades={grades}
        subjects={subjects}
        newStudentHref="/admin/usuarios/novo"
        importHref="/colaborador/alunos/importar"
        detailBasePath="/colaborador/alunos"
      />
    </div>
  )
}
