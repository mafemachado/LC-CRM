import { NextRequest, NextResponse } from "next/server"
import { prisma }                    from "@/lib/prisma"
import bcrypt                        from "bcryptjs"

const ONE_TIME_TOKEN = "bfc52bd3-24e2-48a1-b321-8b75cd0ba576"

export async function POST(req: NextRequest) {
  const { token, email, name, password, phone } = await req.json()

  if (token !== ONE_TIME_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!email || !password) {
    return NextResponse.json({ error: "email e password obrigatórios" }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where:  { email },
    update: { name: name ?? "Administrador", password: hash, role: "ADMIN", active: true },
    create: {
      name:     name ?? "Administrador",
      email,
      password: hash,
      role:     "ADMIN",
      active:   true,
      phone:    phone ? phone.replace(/\D/g, "") : null,
    },
  })

  return NextResponse.json({ ok: true, id: user.id, email: user.email })
}
