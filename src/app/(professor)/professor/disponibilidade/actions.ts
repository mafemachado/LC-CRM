"use server"

import { prisma }        from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Availability } from "@/lib/availability"

export async function saveAvailabilityAction(teacherId: string, availability: Availability) {
  await prisma.teacher.update({
    where: { id: teacherId },
    data:  { availability: availability as object },
  })
  revalidatePath("/professor/disponibilidade")
}
