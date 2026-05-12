import { auth }   from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, CalendarCheck, Clock, Users } from "lucide-react"

export default async function ColaboradorDashboard() {
  const session = await auth()
  const [totalAlunos, totalProfessores, pendentes] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.lessonRequest.count({ where: { status: "PENDING" } }),
  ])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">{saudacao}, {session?.user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie os agendamentos e alunos.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Alunos Ativos",      value: totalAlunos,      icon: GraduationCap, color: "text-primary",    bg: "bg-primary/10"   },
          { title: "Professores",        value: totalProfessores, icon: Users,         color: "text-secondary",  bg: "bg-secondary/10" },
          { title: "Ag. Confirmação",    value: pendentes,        icon: Clock,         color: "text-orange-500", bg: "bg-orange-50"    },
        ].map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-bold font-sub mt-1">{value}</p>
              </div>
              <div className={`${bg} p-2.5 rounded-xl`}><Icon className={`w-5 h-5 ${color}`} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-sub text-base flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" /> Aulas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma aula hoje</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
