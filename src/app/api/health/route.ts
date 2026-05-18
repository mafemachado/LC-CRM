import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const count = await prisma.user.count()
    const admin = await prisma.user.findUnique({
      where: { email: "admin@licaodecasa.com.br", active: true },
      select: { id: true, email: true, active: true, password: true },
    })
    const passwordMatch = admin
      ? await bcrypt.compare("Admin@123", admin.password)
      : false
    return NextResponse.json({ ok: true, users: count, adminFound: !!admin, passwordMatch })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
