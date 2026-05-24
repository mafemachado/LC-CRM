"use client"

import { useState } from "react"
import { Badge }    from "@/components/ui/badge"
import { UserRound, ExternalLink } from "lucide-react"
import { format }   from "date-fns"
import { ptBR }     from "date-fns/locale"
import Link         from "next/link"

export interface HistoryItem {
  id:          string
  studentId:   string
  studentName: string
  guardianName: string | null
  subjectName: string
  teacherName: string
  preferredAt: Date
  status:      "APPROVED" | "REJECTED"
  reason:      string | null
}

type Period = "week" | "month" | "all"

interface HistoryTabsProps {
  items: HistoryItem[]
}

export function HistoryTabs({ items }: HistoryTabsProps) {
  const [tab, setTab]       = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [period, setPeriod] = useState<Period>("week")

  const now = new Date()
  const filtered = items.filter((item) => {
    if (item.status !== tab) return false
    if (period === "week") {
      return item.preferredAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    if (period === "month") {
      return item.preferredAt >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    return true
  })

  const approvedCount = items.filter((i) => i.status === "APPROVED").length
  const rejectedCount = items.filter((i) => i.status === "REJECTED").length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Tabs aprovadas / recusadas */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setTab("APPROVED")}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
              tab === "APPROVED"
                ? "bg-green-100 text-green-800 font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Aprovadas
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {approvedCount}
            </Badge>
          </button>
          <button
            type="button"
            onClick={() => setTab("REJECTED")}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
              tab === "REJECTED"
                ? "bg-red-50 text-red-700 font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Recusadas
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {rejectedCount}
            </Badge>
          </button>
        </div>

        {/* Filtro de período */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
          {(["week", "month", "all"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1.5 transition-colors ${
                period === p
                  ? "bg-muted font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {p === "week" ? "7 dias" : p === "month" ? "30 dias" : "Tudo"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nenhuma solicitação {tab === "APPROVED" ? "aprovada" : "recusada"} no período
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30"
            >
              <div className="min-w-0">
                <Link
                  href={`/colaborador/alunos/${item.studentId}`}
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {item.studentName}
                  <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                </Link>
                {item.guardianName && (
                  <div className="flex items-center gap-1">
                    <UserRound className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Resp.: {item.guardianName}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {item.subjectName} · Prof. {item.teacherName} ·{" "}
                  {format(item.preferredAt, "dd/MM/yyyy", { locale: ptBR })}
                </p>
                {item.reason && (
                  <p className="text-xs text-muted-foreground/60 italic truncate">
                    {item.reason}
                  </p>
                )}
              </div>
              <Badge
                variant={item.status === "APPROVED" ? "default" : "destructive"}
                className="shrink-0"
              >
                {item.status === "APPROVED" ? "Aprovada" : "Recusada"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
