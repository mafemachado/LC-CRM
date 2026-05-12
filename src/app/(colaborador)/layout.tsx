import { redirect }   from "next/navigation"
import { auth }       from "@/lib/auth"
import { AppLayout }  from "@/components/shared/app-layout"

export default async function ColaboradorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user)                        redirect("/login")
  if (!["ADMIN", "COLLABORATOR"].includes(session.user.role)) redirect("/login")

  return (
    <AppLayout
      name={session.user.name  ?? ""}
      email={session.user.email ?? ""}
      role={session.user.role}
      image={session.user.image}
    >
      {children}
    </AppLayout>
  )
}
