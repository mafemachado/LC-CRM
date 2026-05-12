import { notFound }     from "next/navigation"
import { prisma }       from "@/lib/prisma"
import { auth }         from "@/lib/auth"
import { PageHeader }   from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge }        from "@/components/ui/badge"
import { Button }       from "@/components/ui/button"
import { Label }        from "@/components/ui/label"
import { Textarea }     from "@/components/ui/textarea"
import { LessonStatusButtons } from "./lesson-status-buttons"
import { format }       from "date-fns"
import { ptBR }         from "date-fns/locale"
import { CalendarDays, User, BookOpen, Monitor, MapPin } from "lucide-react"

interface LessonDetailProps {
  params: Promise<{ id: string }>
}

export default async function LessonDetailPage({ params }: LessonDetailProps) {
  const { id }  = await params
  const session = await auth()

  const lesson = await prisma.lesson.findUnique({
    where:   { id },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
      subject: true,
      homework: true,
    },
  })
  if (!lesson) notFound()

  const isCompleted = ["COMPLETED", "CANCELLED", "MISSED"].includes(lesson.status)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="DETALHES DA AULA" backHref="/professor/agenda" />

      {/* Resumo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-sub text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          {[
            { icon: User,        label: "Aluno",       value: lesson.student.user.name },
            { icon: BookOpen,    label: "Matéria",     value: lesson.subject.name       },
            { icon: CalendarDays,label: "Data/Hora",   value: format(lesson.scheduledAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) },
            { icon: lesson.modality === "ONLINE" ? Monitor : MapPin, label: "Modalidade", value: lesson.modality === "ONLINE" ? "Online" : "Presencial" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2">
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Registrar conteúdo / Alterar status */}
      {!isCompleted ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base">Registrar Aula</CardTitle>
          </CardHeader>
          <CardContent>
            <LessonStatusButtons lessonId={lesson.id} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-sub text-base flex items-center gap-2">
              Registro
              <Badge variant={lesson.status === "COMPLETED" ? "default" : "destructive"}>
                {lesson.status === "COMPLETED" ? "Realizada" : lesson.status === "CANCELLED" ? "Cancelada" : "Faltou"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {lesson.topicsCovered && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Conteúdo ensinado</p>
                <p className="bg-muted/50 rounded-lg p-3">{lesson.topicsCovered}</p>
              </div>
            )}
            {lesson.teacherNotes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Observações do professor</p>
                <p className="bg-muted/50 rounded-lg p-3">{lesson.teacherNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
