import { auth }           from "@/lib/auth"
import { prisma }         from "@/lib/prisma"
import { PageHeader }     from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge }          from "@/components/ui/badge"
import { LinkButton }     from "@/components/shared/link-button"
import { CalendarDays, Clock, MapPin, Monitor, Star, BookOpen } from "lucide-react"
import { format }         from "date-fns"
import { ptBR }           from "date-fns/locale"

const STATUS_CONFIG = {
  SCHEDULED:  { label: "Agendada",   variant: "secondary"   as const, color: "text-blue-600"   },
  CONFIRMED:  { label: "Confirmada", variant: "default"     as const, color: "text-green-600"  },
  COMPLETED:  { label: "Realizada",  variant: "outline"     as const, color: "text-gray-600"   },
  CANCELLED:  { label: "Cancelada",  variant: "destructive" as const, color: "text-red-600"    },
  MISSED:     { label: "Faltou",     variant: "destructive" as const, color: "text-orange-600" },
}

const REQUEST_CONFIG = {
  PENDING:    { label: "Aguardando",  variant: "secondary"   as const },
  APPROVED:   { label: "Aprovada",    variant: "default"     as const },
  REJECTED:   { label: "Recusada",    variant: "destructive" as const },
}

interface AulasPageProps {
  searchParams: Promise<{ success?: string }>
}

export default async function AulasPage({ searchParams }: AulasPageProps) {
  const session = await auth()
  const { success } = await searchParams

  const student = await prisma.student.findFirst({
    where: { user: { email: session?.user?.email ?? "" } },
  })

  const [lessons, requests] = await Promise.all([
    student ? prisma.lesson.findMany({
      where:   { studentId: student.id },
      include: { teacher: { include: { user: true } }, subject: true },
      orderBy: { scheduledAt: "desc" },
      take:    50,
    }) : [],
    student ? prisma.lessonRequest.findMany({
      where:   { studentId: student.id, status: "PENDING" },
      include: { teacher: { include: { user: true } }, subject: true },
      orderBy: { requestedAt: "desc" },
    }) : [],
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="MINHAS AULAS" />
        <LinkButton href="/aluno/agendar">
          <CalendarDays className="w-4 h-4 mr-2" /> Agendar Aula
        </LinkButton>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {decodeURIComponent(success)}
        </div>
      )}

      {/* Solicitações pendentes */}
      {requests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Solicitações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{r.subject?.name ?? "Matéria não informada"}</p>
                  <p className="text-xs text-muted-foreground">
                    Prof. {r.teacher.user.name} · {format(r.preferredAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Badge variant={REQUEST_CONFIG[r.status].variant}>
                  {REQUEST_CONFIG[r.status].label}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Histórico de aulas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-sub text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Histórico de Aulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma aula encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const cfg = STATUS_CONFIG[lesson.status]
                return (
                  <div key={lesson.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                    {/* Data */}
                    <div className="shrink-0 w-14 text-center">
                      <p className="text-xl font-bold font-sub text-primary leading-none">
                        {format(lesson.scheduledAt, "dd")}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {format(lesson.scheduledAt, "MMM", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(lesson.scheduledAt, "HH:mm")}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{lesson.subject.name}</p>
                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Prof. {lesson.teacher.user.name}
                      </p>
                      {lesson.topicsCovered && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          📚 {lesson.topicsCovered}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {lesson.modality === "ONLINE"
                            ? <><Monitor className="w-3 h-3" /> Online</>
                            : <><MapPin className="w-3 h-3" /> Presencial</>
                          }
                        </span>
                        {lesson.studentRating && (
                          <span className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star className="w-3 h-3 fill-yellow-500" /> {lesson.studentRating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
