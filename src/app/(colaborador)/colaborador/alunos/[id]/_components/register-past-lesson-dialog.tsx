"use client"

import { useState, useTransition } from "react"
import { useRouter }  from "next/navigation"
import { toast }      from "sonner"
import { createLessonDirectAction, createGroupLessonAction } from "@/lib/actions/lesson-request"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import {
  History, Loader2, CheckCircle2, XCircle, MonitorPlay, School, Users,
} from "lucide-react"

interface Teacher { id: string; name: string }
interface Subject { id: string; name: string }
interface Student { id: string; name: string }

interface RegisterPastLessonDialogProps {
  studentId:   string
  teachers:    Teacher[]
  subjects:    Subject[]
  allStudents: Student[]
}

export function RegisterPastLessonDialog({
  studentId,
  teachers,
  subjects,
  allStudents,
}: RegisterPastLessonDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()

  const today = new Date().toISOString().slice(0, 10)

  const [date,      setDate]      = useState(today)
  const [time,      setTime]      = useState("08:00")
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "")
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "")
  const [duration,  setDuration]  = useState("60")
  const [modality,  setModality]  = useState<"PRESENCIAL" | "ONLINE">("PRESENCIAL")
  const [topics,    setTopics]    = useState("")
  const [status,    setStatus]    = useState<"COMPLETED" | "MISSED">("COMPLETED")

  // Dupla
  const [isDuo,          setIsDuo]          = useState(false)
  const [secondStudentId, setSecondStudentId] = useState(allStudents[0]?.id ?? "")
  const [price1,         setPrice1]         = useState("")
  const [price2,         setPrice2]         = useState("")

  function reset() {
    setDate(today); setTime("08:00")
    setTeacherId(teachers[0]?.id ?? ""); setSubjectId(subjects[0]?.id ?? "")
    setDuration("60"); setModality("PRESENCIAL"); setTopics(""); setStatus("COMPLETED")
    setIsDuo(false); setSecondStudentId(allStudents[0]?.id ?? "")
    setPrice1(""); setPrice2("")
  }

  function handleOpen(v: boolean) {
    if (v) reset()
    setOpen(v)
  }

  function submit() {
    if (!date || !teacherId || !subjectId) {
      toast.error("Preencha data, professor e matéria")
      return
    }

    if (isDuo) {
      if (!secondStudentId) { toast.error("Selecione o segundo aluno"); return }
      if (secondStudentId === studentId) { toast.error("Selecione um aluno diferente"); return }
      const p1 = parseFloat(price1)
      const p2 = parseFloat(price2)
      if (!price1 || p1 < 0) { toast.error("Informe o valor do aluno 1"); return }
      if (!price2 || p2 < 0) { toast.error("Informe o valor do aluno 2"); return }

      start(async () => {
        try {
          await createGroupLessonAction({
            teacherId,
            subjectId,
            studentIds:   [studentId, secondStudentId],
            date,
            time,
            modality,
            duration:     parseInt(duration) || 60,
            statusOverride: status,
            studentPrices: [
              { studentId,       price: p1 },
              { studentId: secondStudentId, price: p2 },
            ],
          })
          toast.success(status === "COMPLETED" ? "Aula em dupla registrada" : "Falta em dupla registrada")
          setOpen(false)
          router.refresh()
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Erro ao registrar aula")
        }
      })
      return
    }

    start(async () => {
      try {
        await createLessonDirectAction({
          teacherId,
          studentId,
          subjectId,
          date,
          time,
          modality,
          duration:      parseInt(duration) || 60,
          statusOverride: status,
          topicsCovered:  topics || undefined,
        })
        toast.success(status === "COMPLETED" ? "Aula registrada como realizada" : "Falta registrada")
        setOpen(false)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao registrar aula")
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpen(true)}
        className="gap-1.5 h-8 text-xs"
      >
        <History className="w-3.5 h-3.5" />
        Registrar aula
      </Button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-sub flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Registrar Aula Passada
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Status */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("COMPLETED")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  status === "COMPLETED"
                    ? "bg-green-100 text-green-700 border-green-400"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Realizada
              </button>
              <button
                type="button"
                onClick={() => setStatus("MISSED")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  status === "MISSED"
                    ? "bg-red-100 text-red-700 border-red-400"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                <XCircle className="w-4 h-4" /> Faltou
              </button>
            </div>

            {/* Dupla toggle */}
            <button
              type="button"
              onClick={() => setIsDuo(v => !v)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDuo
                  ? "bg-brand-blue/10 text-brand-blue border-brand-blue/40"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              <Users className="w-4 h-4" />
              {isDuo ? "Aula em dupla (ativado)" : "Aula em dupla"}
            </button>

            {/* Segundo aluno + preços */}
            {isDuo && (
              <div className="rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Segundo aluno *</Label>
                  <select
                    value={secondStudentId}
                    onChange={e => setSecondStudentId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Selecione</option>
                    {allStudents
                      .filter(s => s.id !== studentId)
                      .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                    }
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Valor aluno 1 (R$) *</Label>
                    <Input
                      type="number" min={0} step="0.01"
                      value={price1}
                      onChange={e => setPrice1(e.target.value)}
                      placeholder="Ex: 80.00"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Valor aluno 2 (R$) *</Label>
                    <Input
                      type="number" min={0} step="0.01"
                      value={price2}
                      onChange={e => setPrice2(e.target.value)}
                      placeholder="Ex: 60.00"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Data e Horário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input
                  type="date" max={today}
                  value={date} onChange={e => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Horário</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            {/* Professor e Matéria */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Professor *</Label>
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Matéria *</Label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Duração e Modalidade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duração (min)</Label>
                <Input
                  type="number" min={30} max={240} step={30}
                  value={duration} onChange={e => setDuration(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Modalidade</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModality("PRESENCIAL")}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg border text-xs font-medium transition-colors ${
                      modality === "PRESENCIAL"
                        ? "bg-primary text-white border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <School className="w-3.5 h-3.5" /> Presencial
                  </button>
                  <button
                    type="button"
                    onClick={() => setModality("ONLINE")}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg border text-xs font-medium transition-colors ${
                      modality === "ONLINE"
                        ? "bg-primary text-white border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <MonitorPlay className="w-3.5 h-3.5" /> Online
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo (só para individual) */}
            {!isDuo && (
              <div className="space-y-1.5">
                <Label>Conteúdo abordado</Label>
                <Input
                  value={topics}
                  onChange={e => setTopics(e.target.value)}
                  placeholder="Ex: Funções do 2º grau, limite e derivada…"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={pending || !date || !teacherId || !subjectId}>
              {pending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando…</>
                : <><History className="w-4 h-4 mr-2" /> Registrar</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
