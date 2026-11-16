import { prisma } from "@/lib/prisma"

/**
 * Data da aula mais recente (qualquer status) de cada aluno, em ISO.
 *
 * Antes as listas de alunos carregavam TODAS as participações de todos os
 * alunos só para pegar a primeira de cada um — o volume crescia a cada aula
 * dada. Aqui o banco devolve uma linha por aluno.
 */
export async function loadLastLessonAt(studentIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (studentIds.length === 0) return map

  const rows = await prisma.$queryRaw<{ studentId: string; last: Date }[]>`
    SELECT lp."studentId", MAX(l."scheduledAt") AS "last"
    FROM "lesson_participants" lp
    JOIN "lessons" l ON l."id" = lp."lessonId"
    WHERE lp."studentId" = ANY(${studentIds})
    GROUP BY lp."studentId"
  `
  for (const r of rows) map.set(r.studentId, r.last.toISOString())
  return map
}
