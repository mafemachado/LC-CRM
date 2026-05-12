import { prisma }      from "@/lib/prisma"
import { PageHeader }  from "@/components/shared/page-header"
import { RequestCard } from "@/components/shared/request-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge }       from "@/components/ui/badge"
import { CalendarDays, ClipboardList } from "lucide-react"
import { format }      from "date-fns"
import { ptBR }        from "date-fns/locale"

const STATUS_CFG = {
  SCHEDULED:  { label: "Agendada",   variant: "secondary"   as const },
  CONFIRMED:  { label: "Confirmada", variant: "default"     as const },
  COMPLETED:  { label: "Realizada",  variant: "outline"     as const },
  CANCELLED:  { label: "Cancelada",  variant: "destructive" as const },
  MISSED:     { label: "Faltou",     variant: "destructive" as const },
}

export default async function AdminAgendaPage() {
  const [pending, lessons] = await Promise.all([
    prisma.lessonRequest.findMany({
      where:   { status: "PENDING" },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.lesson.findMany({
      where:   { scheduledAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
      orderBy: { scheduledAt: "asc" },
      take:    50,
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="AGENDA" description="Visão geral de todas as aulas" />

      {pending.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-orange-500" />
              Aguardando Confirmação
              <Badge variant="destructive">{pending.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((r) => (
              <RequestCard
                key={r.id} id={r.id}
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-sub text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Aulas (últimos 7 dias + próximas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma aula no período</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border">
                  <div className="flex gap-3 min-w-0">
                    <div className="shrink-0 text-center w-10">
                      <p className="text-base font-bold text-primary">{format(l.scheduledAt, "dd")}</p>
                      <p className="text-xs text-muted-foreground">{format(l.scheduledAt, "HH:mm")}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{l.student.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {l.subject.name} · Prof. {l.teacher.user.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant={STATUS_CFG[l.status].variant}>{STATUS_CFG[l.status].label}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
