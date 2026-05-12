"use client"

import { useState, useTransition } from "react"
import { Button }   from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label }    from "@/components/ui/label"
import { updateLessonStatusAction } from "@/lib/actions/lesson-request"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function LessonStatusButtons({ lessonId }: { lessonId: string }) {
  const [topics, setTopics]   = useState("")
  const [notes,  setNotes]    = useState("")
  const [pending, start]      = useTransition()
  const router                = useRouter()

  const handle = (status: "COMPLETED" | "CANCELLED" | "MISSED") => {
    start(async () => {
      await updateLessonStatusAction(lessonId, status, topics || undefined, notes || undefined)
      router.push("/professor/agenda")
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topics">Conteúdo ensinado *</Label>
        <Textarea
          id="topics" value={topics} onChange={(e) => setTopics(e.target.value)}
          placeholder="Ex: Equações do 2º grau, fórmula de Bhaskara, exercícios 1-5..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Aluno teve dificuldade com discriminante, precisa revisar..."
          rows={2}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending || !topics} onClick={() => handle("COMPLETED")}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Aula Realizada
        </Button>
        <Button variant="outline" disabled={pending}
          className="text-orange-500 border-orange-300 hover:bg-orange-50"
          onClick={() => handle("MISSED")}>
          <AlertCircle className="w-4 h-4 mr-2" /> Aluno Faltou
        </Button>
        <Button variant="outline" disabled={pending}
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => handle("CANCELLED")}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar Aula
        </Button>
      </div>
    </div>
  )
}
