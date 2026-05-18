import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️  Limpando banco de dados...")

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
