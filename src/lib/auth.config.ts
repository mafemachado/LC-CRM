import type { NextAuthConfig } from "next-auth"

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
  session:   { strategy: "jwt" },
  pages:     { signIn: "/login" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
