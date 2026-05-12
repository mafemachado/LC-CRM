"use server"

import { prisma }              from "@/lib/prisma"
import { auth }                from "@/lib/auth"
import { lessonRequestSchema } from "@/lib/validations/lesson"
import { revalidatePath }      from "next/cache"
import { redirect }            from "next/navigation"
import { notifyLessonRequest } from "@/lib/notifications"
import { format }              from "date-fns"
import { ptBR }                from "date-fns/locale"

export async function requestLessonAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const raw    = Object.fromEntries(formData)
  const parsed = lessonRequestSchema.safeParse(raw)
  if (!parsed.success) {
    redirect(`/aluno/agendar?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos")}`)
  }

  const student = await prisma.student.findFirst({
    where:   { user: { email: session.user.email ?? "" } },
    include: {
      user:     true,
      packages: { where: { status: "ACTIVE", remainingLessons: { gt: 0 } } },
    },
  })

  if (!student)                    redirect("/aluno/agendar?error=Perfil+de+aluno+não+encontrado")
  if (student.packages.length === 0) redirect("/aluno/agendar?error=Você+não+tem+aulas+disponíveis.+Adquira+um+pacote.")

  const { teacherId, subjectId, preferredAt, modality, notes } = parsed.data

  const [teacher, subject] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } }),
    prisma.subject.findUnique({ where: { id: subjectId } }),
  ])

  await prisma.lessonRequest.create({
    data: {
      studentId:   student.id,
      teacherId,
      subjectId,
      preferredAt: new Date(preferredAt),
      status:      "PENDING",
      reason:      notes,
    },
  })

  // Notifica o professor
  if (teacher) {
    await notifyLessonRequest({
      teacherId:    teacher.id,
      teacherEmail: teacher.user.email,
      teacherPhone: teacher.user.phone,
      studentName:  student.user.name,
      subject:      subject?.name ?? "–",
      preferredAt:  format(new Date(preferredAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
    })
  }

  revalidatePath("/aluno/aulas")
  redirect("/aluno/aulas?success=Solicitação+enviada!+Aguarde+a+confirmação+do+professor.")
}
