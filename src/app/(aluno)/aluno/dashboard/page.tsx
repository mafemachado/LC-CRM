import { auth }   from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge }  from "@/components/ui/badge"
import { BookOpen, CalendarCheck, PenLine, FolderOpen } from "lucide-react"

export default async function AlunoDashboard() {
  const session = await auth()
  const student = await prisma.student.findFirst({
    where:   { user: { email: session?.user?.email ?? "" } },
    include: { packages: { where: { status: "ACTIVE" } } },
  })

  const saldoAulas  = student?.packages.reduce((acc, p) => acc + p.remainingLessons, 0) ?? 0
  const hora        = new Date().getHours()
  const saudacao    = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">{saudacao}, {session?.user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Veja seu progresso e próximas aulas.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo de Aulas</p>
              <p className="text-2xl font-bold font-sub mt-1">{saldoAulas}</p>
              {saldoAulas <= 2 && saldoAulas > 0 && (
                <Badge variant="destructive" className="mt-1 text-xs">Saldo baixo</Badge>
              )}
            </div>
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        {[
          { title: "Próximas Aulas",    value: 0, icon: CalendarCheck, color: "text-secondary",  bg: "bg-secondary/10" },
          { title: "Lições Pendentes",  value: 0, icon: PenLine,       color: "text-orange-500", bg: "bg-orange-50"    },
          { title: "Materiais Novos",   value: 0, icon: FolderOpen,    color: "text-green-600",  bg: "bg-green-50"     },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> Próximas Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma aula agendada</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <PenLine className="w-4 h-4 text-primary" /> Lições de Casa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <PenLine className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma lição pendente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
