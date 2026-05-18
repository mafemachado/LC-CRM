"use server"

import { prisma }         from "@/lib/prisma"
import { auth }           from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z }              from "zod"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Sem permissão")
}

const subjectSchema = z.object({
  name:  z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(60),
  level: z.string().max(60).optional(),
})

export async function createSubjectAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin()

  const parsed = subjectSchema.safeParse({
    name:  formData.get("name"),
    level: formData.get("level") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const exists = await prisma.subject.findFirst({ where: { name: { equals: parsed.data.name, mode: "insensitive" } } })
  if (exists) return { error: "Já existe uma matéria com esse nome" }

  await prisma.subject.create({ data: parsed.data })
  revalidatePath("/admin/config")
  return {}
}

export async function updateSubjectAction(
  id: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin()

  const parsed = subjectSchema.safeParse({
    name:  formData.get("name"),
    level: formData.get("level") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const conflict = await prisma.subject.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" }, NOT: { id } },
  })
  if (conflict) return { error: "Já existe uma matéria com esse nome" }

  await prisma.subject.update({ where: { id }, data: parsed.data })
  revalidatePath("/admin/config")
  return {}
}

export async function deleteSubjectAction(id: string): Promise<{ error?: string }> {
  await requireAdmin()

  const inUse = await prisma.lesson.findFirst({ where: { subjectId: id } })
  if (inUse) return { error: "Matéria não pode ser excluída pois possui aulas registradas" }

  const inRequest = await prisma.lessonRequest.findFirst({ where: { subjectId: id } })
  if (inRequest) return { error: "Matéria não pode ser excluída pois possui solicitações de aula" }

  await prisma.subject.delete({ where: { id } })
  revalidatePath("/admin/config")
  return {}
}
