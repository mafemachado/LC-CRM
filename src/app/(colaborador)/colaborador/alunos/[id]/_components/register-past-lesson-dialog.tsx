"use client"

import { useState, useTransition } from "react"
import { useRouter }  from "next/navigation"
import { toast }      from "sonner"
import { createLessonDirectAction } from "@/lib/actions/lesson-request"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { History, Loader2, CheckCircle2, XCircle, MonitorPlay, School } from "lucide-react"

interface Teacher { id: string; name: string }
interface Subject { id: string; name: string }

interface RegisterPastLessonDialogProps {
  studentId: string
  teachers:  Teacher[]
  subjects:  Subject[]
}

export function RegisterPastLessonDialog({
  studentId,
  teachers,
  subjects,
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

  function reset() {
    setDate(today); setTime("08:00")
    setTeacherId(teachers[0]?.id ?? ""); setSubjectId(subjects[0]?.id ?? "")
    setDuration("60"); setModality("PRESENCIAL"); setTopics(""); setStatus("COMPLETED")
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
    start(async () => {
      try {
        await createLessonDirectAction({
          teacherId,
          studentId,
          subjectId,
          date,
          time,
          modality,
          duration: parseInt(duration) || 60,
          statusOverride: status,
          topicsCovered: topics || undefined,
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
        <DialogContent className="max-w-lg">
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
                <CheckCircle2 className="w-4 h-4" />
                Realizada
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
                <XCircle className="w-4 h-4" />
                Faltou
              </button>
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input
                  type="date"
                  max={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
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
                  type="number"
                  min={30} max={240} step={30}
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
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
                    <School className="w-3.5 h-3.5" />
                    Presencial
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
                    <MonitorPlay className="w-3.5 h-3.5" />
                    Online
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-1.5">
              <Label>Conteúdo abordado</Label>
              <Input
                value={topics}
                onChange={e => setTopics(e.target.value)}
                placeholder="Ex: Funções do 2º grau, limite e derivada…"
              />
            </div>
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
