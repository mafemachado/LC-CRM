import type { NextAuthConfig } from "next-auth"
import type { Role } from "@prisma/client"

// Mapeamento role → página inicial (sem Prisma — seguro para Edge)
export const ROLE_HOME: Record<string, string> = {
  ADMIN:        "/admin/dashboard",
  COLLABORATOR: "/colaborador/dashboard",
  TEACHER:      "/professor/dashboard",
  STUDENT:      "/aluno/dashboard",
  GUARDIAN:     "/aluno/dashboard",
}

// Config base sem providers (Edge-compatible — sem Prisma, sem bcrypt)
export const authConfig = {
  session: { strategy: "jwt" as const },
  pages:   { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role: Role }).role
      }
      return token
    },
    session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
} satisfies NextAuthConfig
