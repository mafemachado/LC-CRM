import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as readline from "readline"

const prisma = new PrismaClient()

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim() === "CONFIRMAR")
    })
  })
}

async function main() {
  console.log("⚠️  ATENÇÃO: esta operação apaga TODOS os dados do banco irreversivelmente.")
  console.log('   Digite CONFIRMAR para continuar ou qualquer outra coisa para cancelar.\n')

  const ok = await confirm("   > ")
  if (!ok) {
    console.log("❌ Operação cancelada.")
    process.exit(0)
  }

  console.log("\n🗑️  Limpando banco de dados...")

  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.teacherPayout.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.homework.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.lessonRequest.deleteMany()
  await prisma.lessonPackage.deleteMany()
  await prisma.teacherSubject.deleteMany()
  await prisma.material.deleteMany()
  await prisma.student.deleteMany()
  await prisma.guardian.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.user.deleteMany()

  console.log("✅ Banco limpo")

  const password = await bcrypt.hash("REDACTED", 12)

  await prisma.user.create({
    data: {
      name:     "Administrador",
      email:    "espacolicao@gmail.com",
      password,
      role:     Role.ADMIN,
      active:   true,
    },
  })

  console.log("✅ Admin criado")
  console.log("   Email: espacolicao@gmail.com")
  console.log("   Senha: REDACTED")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
