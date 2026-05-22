"use client"

import { useState }      from "react"
import { useFormStatus } from "react-dom"
import { Button }        from "@/components/ui/button"
import { Input }         from "@/components/ui/input"
import { Label }         from "@/components/ui/label"
import { Settings, X, CalendarX, Info, Loader2 } from "lucide-react"
import {
  setOperationalConfigAction,
  addClosedDateAction,
  removeClosedDateAction,
} from "@/lib/actions/config"
import { format, parseISO } from "date-fns"
import { ptBR }             from "date-fns/locale"

const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending
        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        : <Settings className="w-4 h-4 mr-2" />
      }
      Salvar funcionamento
    </Button>
  )
}

function AddDateButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
      Adicionar data
    </Button>
  )
}

function RemoveDateButton({ date }: { date: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors disabled:opacity-60"
    >
      {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
      {pending
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <X className="w-3 h-3" />
      }
    </button>
  )
}

interface Props {
  days:        number[]
  startTime:   string
  endTime:     string
  closedDates: string[]
}

export function OperationalConfigForm({ days, startTime, endTime, closedDates }: Props) {
  const [selectedDays, setSelectedDays] = useState<number[]>(days)

  function toggleDay(i: number) {
    setSelectedDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
    )
  }

  return (
    <>
      <form action={setOperationalConfigAction} className="space-y-5">
        {selectedDays.map(d => (
          <input key={d} type="hidden" name="operational_days" value={String(d)} />
        ))}

        <div className="space-y-2">
          <Label>Dias de atendimento</Label>
          <div className="flex flex-wrap gap-2">
            {DOW_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors select-none ${
                  selectedDays.includes(i)
                    ? "bg-primary text-white border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Alunos não podem solicitar aulas em dias fora deste calendário.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Horário de atendimento</Label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10">Início</span>
              <Input type="time" name="operational_start" defaultValue={startTime} className="w-32" />
            </div>
            <span className="text-muted-foreground">–</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-8">Fim</span>
              <Input type="time" name="operational_end" defaultValue={endTime} className="w-32" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Agendamentos fora deste intervalo serão bloqueados automaticamente.
          </p>
        </div>

        <SaveButton />
      </form>

      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center gap-2">
          <CalendarX className="w-4 h-4 text-muted-foreground" />
          <Label>Feriados e fechamentos excepcionais</Label>
        </div>

        {closedDates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {closedDates.map(d => (
              <form key={d} action={removeClosedDateAction} className="inline-flex">
                <input type="hidden" name="closed_date" value={d} />
                <RemoveDateButton date={d} />
              </form>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Nenhuma data de fechamento cadastrada.</p>
        )}

        <form action={addClosedDateAction} className="flex items-center gap-2">
          <Input type="date" name="closed_date" className="w-44" />
          <AddDateButton />
        </form>

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            Datas aqui bloqueiam agendamentos mesmo que o professor esteja disponível.
            Ideal para feriados prolongados ou manutenções.
          </p>
        </div>
      </div>
    </>
  )
}
