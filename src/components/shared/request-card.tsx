"use client"

import { useTransition }      from "react"
import { Button }             from "@/components/ui/button"
import { Badge }              from "@/components/ui/badge"
import { approveRequestAction, rejectRequestAction } from "@/lib/actions/lesson-request"
import { CalendarDays, Clock, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { format }             from "date-fns"
import { ptBR }               from "date-fns/locale"

interface RequestCardProps {
  id:             string
  studentName:    string
  teacherName:    string
  subjectName:    string
  preferredAt:    Date
  notes?:         string | null
  hasConflict?:   boolean
  outOfSchedule?: boolean
}

export function RequestCard({
  id, studentName, teacherName, subjectName,
  preferredAt, notes, hasConflict, outOfSchedule,
}: RequestCardProps) {
  const [pending, startTransition] = useTransition()

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-xl border bg-card transition-colors ${
      hasConflict ? "border-destructive/50 bg-destructive/5" :
      outOfSchedule ? "border-orange-300/60 bg-orange-50/50" :
      "border-border"
    }`}>
      {/* Alertas */}
      {(hasConflict || outOfSchedule) && (
        <div className="flex flex-col gap-1">
          {hasConflict && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <strong>Conflito de horário:</strong> o professor já tem uma aula nesse horário.
            </div>
          )}
          {outOfSchedule && !hasConflict && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-100 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <strong>Fora da disponibilidade:</strong> o horário solicitado está fora da agenda do professor.
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Info */}
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
                {format(preferredAt, "EEEE, dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            {notes && (
              <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                &ldquo;{notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Ações */}
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
          <Button size="sm" disabled={pending}
            onClick={() => startTransition(() => approveRequestAction(id))}>
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
            Aprovar
          </Button>
        </div>
      </div>
    </div>
  )
}
