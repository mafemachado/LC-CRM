import type { NextAuthConfig } from "next-auth"
import type { Role }           from "@prisma/client"

// Mapeamento role → home (sem Prisma — seguro para Edge runtime)
export const ROLE_HOME: Record<string, string> = {
  ADMIN:        "/admin/dashboard",
  COLLABORATOR: "/colaborador/dashboard",
  TEACHER:      "/professor/dashboard",
  STUDENT:      "/aluno/dashboard",
  GUARDIAN:     "/aluno/dashboard",
}

// Config mínima para o middleware Edge — sem callbacks, sem Prisma, sem bcrypt
export const authConfig: NextAuthConfig = {
  trustHost: true,
  // Cookie vive 30 dias; a validade REAL do token é definida em auth.ts (jwt.encode)
  // conforme o "Lembrar de mim": 30 dias se marcado, 8 horas se não.
  session:   { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages:     { signIn: "/login" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
}
