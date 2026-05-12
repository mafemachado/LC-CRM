"use server"

import { prisma }              from "@/lib/prisma"
import { auth }                from "@/lib/auth"
import { lessonRequestSchema } from "@/lib/validations/lesson"
import { revalidatePath }      from "next/cache"
import { redirect }            from "next/navigation"

export async function requestLessonAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const raw = Object.fromEntries(formData)
  const parsed = lessonRequestSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    redirect(`/aluno/agendar?error=${encodeURIComponent(msg)}`)
  }

  const student = await prisma.student.findFirst({
    where:   { user: { email: session.user.email ?? "" } },
    include: { packages: { where: { status: "ACTIVE", remainingLessons: { gt: 0 } } } },
  })

  if (!student) redirect("/aluno/agendar?error=Perfil+de+aluno+não+encontrado")
  if (student.packages.length === 0) redirect("/aluno/agendar?error=Você+não+tem+aulas+disponíveis.+Adquira+um+pacote.")

  const { teacherId, subjectId, preferredAt, modality, notes } = parsed.data

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

  revalidatePath("/aluno/aulas")
  redirect("/aluno/aulas?success=Solicitação+enviada!+Aguarde+a+confirmação+do+professor.")
}
