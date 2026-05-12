"use client"

import { useTransition }      from "react"
import { Button }             from "@/components/ui/button"
import { Badge }              from "@/components/ui/badge"
import { approveRequestAction, rejectRequestAction } from "@/lib/actions/lesson-request"
import { CalendarDays, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { format }             from "date-fns"
import { ptBR }               from "date-fns/locale"

interface RequestCardProps {
  id:          string
  studentName: string
  teacherName: string
  subjectName: string
  preferredAt: Date
  notes?:      string | null
}

export function RequestCard({ id, studentName, teacherName, subjectName, preferredAt, notes }: RequestCardProps) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm">{studentName}</p>
          <p className="text-xs text-muted-foreground">{subjectName} · Prof. {teacherName}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(preferredAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
          {notes && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">&ldquo;{notes}&rdquo;</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary" className="text-xs">Pendente</Badge>
        <Button
          size="sm" variant="outline"
          disabled={pending}
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => startTransition(() => rejectRequestAction(id))}
        >
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
          Recusar
        </Button>
        <Button
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => approveRequestAction(id))}
        >
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
          Aprovar
        </Button>
      </div>
    </div>
  )
}
