import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "espacolicao@gmail.com" } })
  if (existing) {
    console.log("✅ Admin já existe no banco.")
    console.log("   Atualizando senha para garantir...")
    await prisma.user.update({
      where: { email: "espacolicao@gmail.com" },
      data: { password: await bcrypt.hash("REDACTED", 12), active: true, role: Role.ADMIN },
    })
    console.log("✅ Senha atualizada com sucesso!")
    return
  }

  await prisma.user.create({
    data: {
      name:     "Administrador",
      email:    "espacolicao@gmail.com",
      password: await bcrypt.hash("REDACTED", 12),
      role:     Role.ADMIN,
      active:   true,
    },
  })
  console.log("✅ Admin criado com sucesso!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
