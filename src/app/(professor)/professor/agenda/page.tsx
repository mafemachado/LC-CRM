import { auth }        from "@/lib/auth"
import { prisma }      from "@/lib/prisma"
import { PageHeader }  from "@/components/shared/page-header"
import { RequestCard } from "@/components/shared/request-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge }       from "@/components/ui/badge"
import { LinkButton }  from "@/components/shared/link-button"
import { Clock, CalendarCheck, CheckCircle2 } from "lucide-react"
import { format }      from "date-fns"
import { ptBR }        from "date-fns/locale"

const STATUS_CFG = {
  SCHEDULED:  { label: "Agendada",   variant: "secondary"   as const },
  CONFIRMED:  { label: "Confirmada", variant: "default"     as const },
  COMPLETED:  { label: "Realizada",  variant: "outline"     as const },
  CANCELLED:  { label: "Cancelada",  variant: "destructive" as const },
  MISSED:     { label: "Faltou",     variant: "destructive" as const },
}

export default async function ProfessorAgendaPage() {
  const session = await auth()

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session?.user?.email ?? "" } },
  })

  const [requests, lessons] = await Promise.all([
    teacher ? prisma.lessonRequest.findMany({
      where:   { teacherId: teacher.id, status: "PENDING" },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
      orderBy: { requestedAt: "asc" },
    }) : [],
    teacher ? prisma.lesson.findMany({
      where:   { teacherId: teacher.id },
      include: { student: { include: { user: true } }, subject: true },
      orderBy: { scheduledAt: "asc" },
      take:    30,
    }) : [],
  ])

  const upcoming = lessons.filter((l) => ["SCHEDULED", "CONFIRMED"].includes(l.status))
  const past     = lessons.filter((l) => ["COMPLETED", "CANCELLED", "MISSED"].includes(l.status))

  return (
    <div className="space-y-6">
      <PageHeader title="MINHA AGENDA" description="Solicitações e aulas agendadas" />

      {/* Solicitações pendentes */}
      {requests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Solicitações Pendentes
              <Badge variant="destructive" className="ml-1">{requests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                id={r.id}
                studentName={r.student.user.name}
                teacherName={r.teacher.user.name}
                subjectName={r.subject?.name ?? "–"}
                preferredAt={r.preferredAt}
                notes={r.reason}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Próximas aulas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-sub text-base flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" /> Próximas Aulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma aula agendada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex gap-3 min-w-0">
                    <div className="shrink-0 text-center w-12">
                      <p className="text-lg font-bold text-primary">{format(lesson.scheduledAt, "dd")}</p>
                      <p className="text-xs text-muted-foreground uppercase">{format(lesson.scheduledAt, "MMM", { locale: ptBR })}</p>
                      <p className="text-xs text-muted-foreground">{format(lesson.scheduledAt, "HH:mm")}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{lesson.student.user.name}</p>
                      <p className="text-xs text-muted-foreground">{lesson.subject.name} · {lesson.modality === "ONLINE" ? "Online" : "Presencial"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={STATUS_CFG[lesson.status].variant}>{STATUS_CFG[lesson.status].label}</Badge>
                    <LinkButton href={`/professor/agenda/${lesson.id}`} variant="outline" size="sm">
                      Ver
                    </LinkButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      {past.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {past.slice(0, 10).map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{lesson.student.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.subject.name} · {format(lesson.scheduledAt, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Badge variant={STATUS_CFG[lesson.status].variant}>{STATUS_CFG[lesson.status].label}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
