"use server"

import { revalidatePath } from "next/cache"
import { prisma }         from "@/lib/prisma"
import { z }              from "zod"

const GoalSchema = z.object({
  year:         z.coerce.number().int().min(2020).max(2100),
  month:        z.coerce.number().int().min(1).max(12),
  revenueGoal:  z.coerce.number().min(0).nullable(),
  lessonsGoal:  z.coerce.number().int().min(0).nullable(),
  studentsGoal: z.coerce.number().int().min(0).nullable(),
})

export async function upsertMonthlyGoal(formData: FormData) {
  const raw = GoalSchema.safeParse({
    year:         formData.get("year"),
    month:        formData.get("month"),
    revenueGoal:  formData.get("revenueGoal")  || null,
    lessonsGoal:  formData.get("lessonsGoal")  || null,
    studentsGoal: formData.get("studentsGoal") || null,
  })

  if (!raw.success) return { error: "Dados inválidos" }

  const { year, month, revenueGoal, lessonsGoal, studentsGoal } = raw.data

  await prisma.monthlyGoal.upsert({
    where:  { year_month: { year, month } },
    update: { revenueGoal, lessonsGoal, studentsGoal },
    create: { year, month, revenueGoal, lessonsGoal, studentsGoal },
  })

  revalidatePath("/admin/metas")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function getGoalsForYear(year: number) {
  return prisma.monthlyGoal.findMany({
    where:   { year },
    orderBy: { month: "asc" },
  })
}

export async function getGoalForMonth(year: number, month: number) {
  return prisma.monthlyGoal.findUnique({
    where: { year_month: { year, month } },
  })
}
