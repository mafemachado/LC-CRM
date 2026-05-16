"use server"

import { prisma }    from "@/lib/prisma"
import { auth }      from "@/lib/auth"
import { z }         from "zod"
import bcrypt        from "bcryptjs"
import { revalidatePath } from "next/cache"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PacoteDigitalizado {
  tipo:        string
  dataInicio:  string
  valor:       string
  dataFim:     string
  pagamento:   string
}

export interface SalvarAlunoPayload {
  nome:        string
  ano:         string
  colegio:     string
  responsavel: string
  contato:     string
  email:       string
  pacotes:     PacoteDigitalizado[]
}

export interface SalvarAlunoResult {
  sucesso:      boolean
  studentId?:   string
  studentName?: string
  error?:       string
  isDuplicate?: boolean
}

// ─── Validation ───────────────────────────────────────────────────────────────

const pacoteSchema = z.object({
  tipo:       z.string(),
  dataInicio: z.string(),
  valor:      z.string(),
  dataFim:    z.string(),
  pagamento:  z.string(),
})

const salvarAlunoSchema = z.object({
  nome:       z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  ano:        z.string().min(1, "Selecione o ano/série"),
  colegio:    z.string().optional(),
  responsavel:z.string().optional(),
  contato:    z.string().optional(),
  email:      z.string().email("E-mail inválido").optional().or(z.literal("")),
  pacotes:    z.array(pacoteSchema),
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePrice(valor: string): number {
  if (!valor) return 0
  const cleaned = valor
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseLessonsCount(tipo: string): number {
  if (!tipo) return 10
  const match = tipo.match(/(\d+)/)
  if (match) return parseInt(match[1], 10)
  return 10
}

function parseBrDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined
  // dd/mm/yyyy
  const match = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
  if (match) {
    const [, dd, mm, yyyy] = match
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    return isNaN(d.getTime()) ? undefined : d
  }
  // Try ISO
  const iso = new Date(dateStr)
  return isNaN(iso.getTime()) ? undefined : iso
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function salvarAlunoDigitalizadoAction(
  payload: SalvarAlunoPayload,
  forceCreate = false
): Promise<SalvarAlunoResult> {
  const session = await auth()
  if (!session?.user || !["ADMIN", "COLLABORATOR"].includes(session.user.role)) {
    return { sucesso: false, error: "Sem permissão" }
  }

  const parsed = salvarAlunoSchema.safeParse(payload)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { sucesso: false, error: msg }
  }

  const { nome, ano, colegio, responsavel, contato, email, pacotes } = parsed.data

  // Check for duplicate: same student name + guardian name
  if (!forceCreate && responsavel) {
    const possible = await prisma.student.findFirst({
      where: {
        user: { name: { equals: nome, mode: "insensitive" } },
        guardian: { user: { name: { contains: responsavel, mode: "insensitive" } } },
      },
      include: { user: true },
    })
    if (possible) {
      return { sucesso: false, isDuplicate: true, studentId: possible.id, studentName: possible.user.name }
    }
  }

  // Generate an internal email if none provided
  const finalEmail = email?.trim()
    ? email.trim()
    : `aluno.${Date.now()}@interno.lcasa`

  // Check if email already taken
  const emailExists = await prisma.user.findUnique({ where: { email: finalEmail } })
  if (emailExists) {
    const uniqueEmail = `aluno.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@interno.lcasa`
    Object.assign(parsed.data, { email: uniqueEmail })
  }

  const resolvedEmail = emailExists
    ? `aluno.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@interno.lcasa`
    : finalEmail

  const tempPassword = `Aluno@${Math.random().toString(36).slice(2, 10)}`
  const hashed       = await bcrypt.hash(tempPassword, 12)

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create user
      const studentUser = await tx.user.create({
        data: {
          name:     nome,
          email:    resolvedEmail,
          password: hashed,
          phone:    contato || null,
          role:     "STUDENT",
        },
      })

      // 2. Create guardian (if provided)
      let guardianId: string | undefined
      if (responsavel) {
        const gEmail = `resp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@interno.lcasa`
        const gPass  = await bcrypt.hash(`Resp@${Math.random().toString(36).slice(2, 8)}`, 12)
        const gUser  = await tx.user.create({
          data: { name: responsavel, email: gEmail, password: gPass, phone: contato || null, role: "GUARDIAN" },
        })
        const g = await tx.guardian.create({ data: { userId: gUser.id } })
        guardianId = g.id
      }

      // 3. Create student profile
      const student = await tx.student.create({
        data: {
          userId:    studentUser.id,
          grade:     ano || "Não informado",
          school:    colegio || null,
          guardianId,
        },
      })

      // 4. Create lesson packages
      for (const pkg of pacotes) {
        const price    = parsePrice(pkg.valor)
        const lessons  = parseLessonsCount(pkg.tipo)
        const expiresAt = parseBrDate(pkg.dataFim)

        if (lessons > 0 || price > 0) {
          await tx.lessonPackage.create({
            data: {
              studentId:       student.id,
              totalLessons:    lessons,
              remainingLessons:lessons,
              pricePerLesson:  price,
              expiresAt,
              status:          "ACTIVE",
            },
          })
        }
      }

      // 5. Activity log
      await tx.activityLog.create({
        data: {
          userId:     session.user.id,
          action:     "DIGITALIZACAO_FICHA",
          entityType: "Student",
          entityId:   student.id,
          metadata: {
            nome,
            pacotesCount: pacotes.filter((p) => parsePrice(p.valor) > 0 || parseLessonsCount(p.tipo) > 0).length,
          },
        },
      })

      return student
    })

    revalidatePath("/admin/usuarios")
    revalidatePath("/colaborador/alunos")

    return { sucesso: true, studentId: result.id, studentName: nome }
  } catch (err) {
    console.error("[salvarAlunoDigitalizadoAction]", err)
    return { sucesso: false, error: "Erro ao salvar no banco. Tente novamente." }
  }
}
