import { redirect }   from "next/navigation"
import { auth }        from "@/lib/auth"
import { ROLE_HOME }   from "@/lib/auth.config"

export default async function HomePage() {
  const session = await auth()
  const role    = session?.user?.role as string | undefined
  redirect(role ? (ROLE_HOME[role] ?? "/login") : "/login")
}
