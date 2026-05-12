import { auth }               from "@/lib/auth"
import { prisma }             from "@/lib/prisma"
import { redirect }           from "next/navigation"
import { PageHeader }         from "@/components/shared/page-header"
import { Card, CardContent }  from "@/components/ui/card"
import { Label }              from "@/components/ui/label"
import { Textarea }           from "@/components/ui/textarea"
import { Button }             from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CalendarDays, BookOpen } from "lucide-react"
import { requestLessonAction } from "./actions"

interface AgendarPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AgendarPage({ searchParams }: AgendarPageProps) {
  const session = await auth()
  const { error } = await searchParams

  const student = await prisma.student.findFirst({
    where:   { user: { email: session?.user?.email ?? "" } },
    include: { packages: { where: { status: "ACTIVE", remainingLessons: { gt: 0 } } } },
  })

  const saldo = student?.packages.reduce((s, p) => s + p.remainingLessons, 0) ?? 0

  if (saldo === 0) {
    return (
      <div>
        <PageHeader title="AGENDAR AULA" backHref="/aluno/dashboard" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <BookOpen className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-sub font-semibold text-lg">Sem saldo de aulas</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Você não tem aulas disponíveis no momento. Entre em contato para adquirir um pacote.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const teachers = await prisma.teacher.findMany({
    where:   { user: { active: true } },
    include: { user: true, subjects: { include: { subject: true } } },
  })

  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } })

  // Data mínima = amanhã
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 16)

  return (
    <div>
      <PageHeader title="AGENDAR AULA" description={`Você tem ${saldo} aula(s) disponível(is)`} />

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {decodeURIComponent(error)}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form action={requestLessonAction} className="space-y-6 max-w-xl">

            <div className="space-y-2">
              <Label>Matéria *</Label>
              <select name="subjectId" required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione a matéria</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Professor *</Label>
              <select name="teacherId" required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione o professor</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.user.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredAt">Data e horário preferido *</Label>
              <input
                id="preferredAt" name="preferredAt" type="datetime-local"
                min={minDate} required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label>Modalidade *</Label>
              <div className="flex gap-4">
                {[
                  { value: "PRESENCIAL", label: "Presencial" },
                  { value: "ONLINE",     label: "Online (Meet/Zoom)" },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="modality" value={value} defaultChecked={value === "PRESENCIAL"} />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea id="notes" name="notes" placeholder="Ex: prefiro sexta de tarde, tenho dúvida em equações..." rows={3} />
            </div>

            <div className="flex gap-3">
              <Button type="submit">
                <CalendarDays className="w-4 h-4 mr-2" /> Enviar Solicitação
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
