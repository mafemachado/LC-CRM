"use server"

import { prisma }        from "@/lib/prisma"
import { auth }          from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function approveRequestAction(requestId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Sem permissão")

  const request = await prisma.lessonRequest.findUnique({
    where:   { id: requestId },
    include: { student: { include: { packages: { where: { status: "ACTIVE", remainingLessons: { gt: 0 } } } } } },
  })
  if (!request) throw new Error("Solicitação não encontrada")

  const pkg = request.student.packages[0]
  if (!pkg) throw new Error("Aluno sem saldo de aulas")

  await prisma.$transaction([
    // Cria a aula
    prisma.lesson.create({
      data: {
        studentId:   request.studentId,
        teacherId:   request.teacherId,
        subjectId:   request.subjectId ?? "",
        scheduledAt: request.preferredAt,
        modality:    "PRESENCIAL",
        status:      "CONFIRMED",
      },
    }),
    // Deduz 1 aula do pacote
    prisma.lessonPackage.update({
      where: { id: pkg.id },
      data:  { remainingLessons: { decrement: 1 }, status: pkg.remainingLessons <= 1 ? "EXHAUSTED" : "ACTIVE" },
    }),
    // Atualiza a solicitação
    prisma.lessonRequest.update({
      where: { id: requestId },
      data:  { status: "APPROVED", approvedBy: session.user.id },
    }),
  ])

  revalidatePath("/colaborador/agendamentos")
  revalidatePath("/admin/agenda")
  revalidatePath("/professor/agenda")
}

export async function rejectRequestAction(requestId: string, reason?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Sem permissão")

  await prisma.lessonRequest.update({
    where: { id: requestId },
    data:  { status: "REJECTED", reason, approvedBy: session.user.id },
  })

  revalidatePath("/colaborador/agendamentos")
  revalidatePath("/admin/agenda")
  revalidatePath("/professor/agenda")
}

export async function updateLessonStatusAction(
  lessonId: string,
  status: "COMPLETED" | "CANCELLED" | "MISSED",
  topicsCovered?: string,
  teacherNotes?: string,
) {
  const session = await auth()
  if (!session?.user) throw new Error("Sem permissão")

  await prisma.lesson.update({
    where: { id: lessonId },
    data:  { status, topicsCovered, teacherNotes },
  })

  revalidatePath("/professor/agenda")
  revalidatePath("/admin/agenda")
}
