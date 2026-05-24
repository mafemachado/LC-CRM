import { notFound }      from "next/navigation"
import { prisma }        from "@/lib/prisma"
import { PageHeader }    from "@/components/shared/page-header"
import { AulaoDetailClient } from "./_components/aulao-detail-client"
import type { AulaoDetail, ParticipantItem, StudentOption } from "./_components/aulao-detail-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AulaoDetailPage({ params }: Props) {
  const { id } = await params

  const lesson = await prisma.lesson.findUnique({
    where:   { id },
    include: {
      teacher: { include: { user: true } },
      subject: true,
      participants: {
        include: {
          student: {
            include: {
              payments: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  })

  if (!lesson || !["AULAO", "GROUP"].includes(lesson.lessonType)) notFound()

  const allStudentsRaw = await prisma.student.findMany({
    select:  { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const price = lesson.priceOverride ? lesson.priceOverride.toNumber() : 0

  const participants: ParticipantItem[] = lesson.participants.map(p => {
    // Busca o pagamento mais recente vinculado à data deste aulão
    const payment = p.student.payments.find(
      pay => pay.dueDate.getTime() === lesson.scheduledAt.getTime()
    ) ?? p.student.payments[0] ?? null

    return {
      studentId:     p.studentId,
      studentName:   p.student.name,
      paymentStatus: (payment?.status ?? null) as ParticipantItem["paymentStatus"],
    }
  })

  const aulao: AulaoDetail = {
    id:                lesson.id,
    lessonType:        lesson.lessonType as "AULAO" | "GROUP",
    title:             lesson.title,
    teacherName:       lesson.teacher.user.name,
    subjectName:       lesson.subject?.name ?? "–",
    scheduledAt:       lesson.scheduledAt.toISOString(),
    duration:          lesson.duration ?? 90,
    modality:          lesson.modality as "PRESENCIAL" | "ONLINE",
    teacherOnsite:     lesson.teacherOnsite,
    status:            lesson.status,
    capacity:          lesson.capacity,
    isFree:            price === 0,
    pricePerStudent:   price > 0 ? price : null,
    participants,
    recurrenceGroupId: lesson.recurrenceGroupId ?? null,
    recurrenceRule:    lesson.recurrenceRule ?? null,
  }

  const allStudents: StudentOption[] = allStudentsRaw.map(s => ({ id: s.id, name: s.name }))

  const title = lesson.title ?? lesson.subject?.name ?? "Aulão"

  return (
    <div>
      <PageHeader
        title={title}
        description={`${lesson.lessonType === "AULAO" ? "Aulão" : "Aula em grupo"} · ${lesson.teacher.user.name}`}
        backHref="/colaborador/auloes"
      />
      <AulaoDetailClient aulao={aulao} allStudents={allStudents} />
    </div>
  )
}
