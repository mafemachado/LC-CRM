"use server"

import { prisma }         from "@/lib/prisma"
import { auth }           from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { notify }         from "@/lib/notifications"
import { format }         from "date-fns"
import { ptBR }           from "date-fns/locale"

async function requireCollaboratorOrAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error("Sem permissão")
  if (!["ADMIN", "COLLABORATOR"].includes(session.user.role)) throw new Error("Sem permissão")
  return session
}

// ─── Marcar Pagamento como Pago ───────────────────────────────────────────────

export async function markPaymentPaidColaboradorAction(id: string) {
  await requireCollaboratorOrAdmin()
  await prisma.payment.update({
    where: { id },
    data:  { status: "PAID", paidAt: new Date() },
  })
  revalidatePath("/colaborador/financeiro")
  revalidatePath("/admin/financeiro/pagamentos")
}

// ─── Enviar WhatsApp de confirmação de aula ────────────────────────────────────

export async function sendLessonWhatsAppAction(lessonId: string) {
  await requireCollaboratorOrAdmin()

  const lesson = await prisma.lesson.findUnique({
    where:   { id: lessonId },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
      subject: true,
    },
  })
  if (!lesson) throw new Error("Aula não encontrada")

  const scheduledAt = format(lesson.scheduledAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  await notify({
    userId:  lesson.student.userId,
    type:    "LESSON_CONFIRMED",
    title:   "Lembrete de aula confirmada",
    message: `Sua aula de ${lesson.subject.name} com ${lesson.teacher.user.name} está confirmada para ${scheduledAt}.`,
    email:   lesson.student.user.email,
    phone:   lesson.student.user.phone ?? undefined,
    data: {
      "Matéria":    lesson.subject.name,
      "Professor":  lesson.teacher.user.name,
      "Data/Hora":  scheduledAt,
      "Modalidade": lesson.modality === "ONLINE" ? "Online" : "Presencial",
    },
  })
}
