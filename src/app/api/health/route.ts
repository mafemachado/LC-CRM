import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const count = await prisma.user.count()
    const admin = await prisma.user.findUnique({
      where: { email: "admin@licaodecasa.com.br", active: true },
      select: { id: true, email: true, active: true, password: true },
    })
    return NextResponse.json({ ok: true, users: count, admin })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
