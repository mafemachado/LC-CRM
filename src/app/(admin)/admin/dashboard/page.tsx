import { auth }   from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge }  from "@/components/ui/badge"
import {
  Users, GraduationCap, CalendarCheck, DollarSign,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
} from "lucide-react"

async function getStats() {
  const [totalAlunos, totalProfessores, aulasHoje, pendentes] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.lesson.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.lessonRequest.count({ where: { status: "PENDING" } }),
  ])
  return { totalAlunos, totalProfessores, aulasHoje, pendentes }
}

export default async function AdminDashboard() {
  const session = await auth()
  const stats   = await getStats()
  const hora    = new Date().getHours()
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-foreground">
          {saudacao}, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aqui está um resumo do que está acontecendo hoje.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total de Alunos"    value={stats.totalAlunos}      icon={GraduationCap} color="text-primary"    bg="bg-primary/10"   />
        <MetricCard title="Professores"        value={stats.totalProfessores} icon={Users}         color="text-secondary"  bg="bg-secondary/10" />
        <MetricCard title="Aulas Hoje"         value={stats.aulasHoje}        icon={CalendarCheck} color="text-green-600"  bg="bg-green-50"     />
        <MetricCard title="Ag. Confirmação"    value={stats.pendentes}        icon={Clock}         color="text-orange-500" bg="bg-orange-50"    alert={stats.pendentes > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Status do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Aulas realizadas", value: "0",        icon: CheckCircle2, color: "text-green-600"   },
              { label: "Aulas canceladas", value: "0",        icon: AlertCircle,  color: "text-destructive" },
              { label: "Receita do mês",   value: "R$ 0,00",  icon: DollarSign,   color: "text-primary"     },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Próximas Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma aula agendada</p>
              <p className="text-xs text-muted-foreground/60 mt-1">As próximas aulas aparecerão aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color, bg, alert = false }: {
  title: string; value: number | string; icon: React.ElementType
  color: string; bg: string; alert?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold font-sub mt-1">{value}</p>
          </div>
          <div className={`${bg} p-2.5 rounded-xl shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        {alert && <Badge variant="destructive" className="mt-2 text-xs">Requer atenção</Badge>}
      </CardContent>
    </Card>
  )
}
