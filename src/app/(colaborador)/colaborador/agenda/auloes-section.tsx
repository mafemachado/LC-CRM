"use client"

import { MapPin, Wifi, Users, Plus, CalendarPlus, Repeat2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AulaoCard } from "./agenda-grid"

interface Props {
  auloes:          AulaoCard[]
  onNewAulao:      () => void
  onNewCommitment: () => void
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "bg-amber-400/15 border-amber-400/50 text-amber-800",
  CONFIRMED: "bg-blue-500/10  border-blue-400/50  text-blue-800",
  COMPLETED: "bg-slate-400/10 border-slate-400/50 text-slate-600",
  CANCELLED: "bg-rose-400/10  border-rose-400/50  text-rose-700",
  MISSED:    "bg-orange-400/10 border-orange-400/50 text-orange-700",
}

export function AuloesSection({ auloes, onNewAulao, onNewCommitment }: Props) {
  const totalAlunos = auloes.reduce((sum, a) => sum + a.enrolled, 0)

  return (
    <div className="border-b border-border bg-muted/10 px-4 py-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AULÕES E GRUPOS</span>
          <span className="text-xs text-muted-foreground">
            {auloes.length} evento{auloes.length !== 1 ? "s" : ""} · {totalAlunos} aluno{totalAlunos !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 border-violet-400/50 text-violet-700 hover:bg-violet-50"
            onClick={onNewAulao}
          >
            <Plus className="w-3.5 h-3.5" />
            Nova aulão
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
            onClick={onNewCommitment}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Compromisso
          </Button>
        </div>
      </div>

      {/* Cards horizontais */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {auloes.map(a => {
          const isAulao     = a.lessonType === "AULAO"
          const countLabel  = a.capacity ? `${a.enrolled}/${a.capacity}` : String(a.enrolled)
          const statusClass = STATUS_COLOR[a.status] ?? STATUS_COLOR.SCHEDULED
          const ModoIcon    = a.modality === "ONLINE" ? Wifi : MapPin

          return (
            <div
              key={a.id}
              className={`flex-shrink-0 rounded-xl border px-4 py-3 min-w-[200px] max-w-[240px] space-y-1.5 ${
                isAulao
                  ? "bg-violet-50 border-violet-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              {/* Badge + horário */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isAulao
                      ? "bg-violet-200 text-violet-800"
                      : "bg-blue-200 text-blue-800"
                  }`}>
                    {isAulao ? "Aulão" : "Grupo"}
                  </span>
                  {a.recurrenceGroupId && (
                    <Repeat2 className={`w-3 h-3 ${isAulao ? "text-violet-500" : "text-blue-500"}`} aria-label="Recorrente" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                  {a.time}–{a.endTime}
                </span>
              </div>

              {/* Título */}
              <p className={`text-[13px] font-semibold leading-tight ${isAulao ? "text-violet-900" : "text-blue-900"}`}>
                {a.title ?? a.subjectName}
              </p>

              {/* Professor */}
              <p className="text-[11px] text-muted-foreground truncate">
                com {a.teacherName.split(" ")[0]}
              </p>

              {/* Footer: alunos + modality */}
              <div className="flex items-center justify-between pt-0.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusClass}`}>
                  <Users className="inline w-3 h-3 mr-0.5" />{countLabel}
                </span>
                <ModoIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
