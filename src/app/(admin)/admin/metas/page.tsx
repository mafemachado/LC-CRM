import { prisma }      from "@/lib/prisma"
import { PageHeader }  from "@/components/shared/page-header"
import { GoalRow }     from "./goal-row"
import { format }      from "date-fns"
import { ptBR }        from "date-fns/locale"
import Link            from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

const MONTH_LABELS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

interface Props {
  searchParams: Promise<{ ano?: string }>
}

export default async function MetasPage({ searchParams }: Props) {
  const { ano: rawAno } = await searchParams
  const now     = new Date()
  const year    = parseInt(rawAno ?? String(now.getFullYear()), 10) || now.getFullYear()
  const curMonth = now.getMonth() + 1

  const goals = await prisma.monthlyGoal.findMany({
    where:   { year },
    orderBy: { month: "asc" },
  })

  const goalsMap = new Map(goals.map((g) => [g.month, g]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="METAS MENSAIS"
        description="Defina receita, aulas e alunos ativos por mês. Se não houver meta cadastrada, o dashboard usa cálculo automático (+10% do mês anterior)."
      />

      {/* Year nav */}
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/metas?ano=${year - 1}`}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground transition-colors hover:bg-[var(--hover)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="min-w-[60px] text-center text-[15px] font-semibold">{year}</span>
        <Link
          href={`/admin/metas?ano=${year + 1}`}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground transition-colors hover:bg-[var(--hover)]"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {/* Header */}
        <div
          className="grid border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground"
          style={{ gridTemplateColumns: "110px 1fr 1fr 1fr 90px" }}
        >
          <span>Mês</span>
          <span className="text-right">Receita (R$)</span>
          <span className="text-right">Aulas</span>
          <span className="text-right">Alunos ativos</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {MONTH_LABELS.map((label, i) => {
            const month = i + 1
            const g     = goalsMap.get(month)
            return (
              <GoalRow
                key={month}
                year={year}
                month={month}
                monthLabel={label}
                revenueGoal={g?.revenueGoal != null ? Number(g.revenueGoal) : null}
                lessonsGoal={g?.lessonsGoal ?? null}
                studentsGoal={g?.studentsGoal ?? null}
                isFuture={year > now.getFullYear() || (year === now.getFullYear() && month > curMonth)}
              />
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
          Meses sem meta usam cálculo automático no dashboard · Última atualização: {format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>
    </div>
  )
}
