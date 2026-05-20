/**
 * Script de emergência: cria ou redefine o usuário admin em qualquer banco.
 * Uso:
 *   ADMIN_EMAIL=x ADMIN_NAME=x ADMIN_PASSWORD=x ADMIN_PHONE=x npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client"
import bcrypt           from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email    = process.env.ADMIN_EMAIL
  const name     = process.env.ADMIN_NAME     ?? "Administrador"
  const password = process.env.ADMIN_PASSWORD
  const phone    = (process.env.ADMIN_PHONE ?? "").replace(/\D/g, "")

  if (!email || !password) {
    console.error("❌ Defina ADMIN_EMAIL e ADMIN_PASSWORD antes de rodar.")
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where:  { email },
    update: { name, password: hash, role: "ADMIN", active: true, phone: phone || undefined },
    create: { name, email, password: hash, role: "ADMIN", active: true, phone: phone || null },
  })

  console.log(`✅ Admin criado/atualizado: ${user.email} (id: ${user.id})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
