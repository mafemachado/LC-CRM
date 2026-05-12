"use client"

import { useState, useEffect } from "react"
import { useFormStatus }       from "react-dom"
import { Button }  from "@/components/ui/button"
import { Label }   from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge }   from "@/components/ui/badge"
import { requestLessonAction } from "./actions"
import { DAY_SHORT } from "@/lib/availability"
import { CalendarDays, Clock, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Teacher { id: string; name: string }
interface Subject { id: string; name: string }

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto">
      {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarDays className="w-4 h-4 mr-2" />}
      Enviar Solicitação
    </Button>
  )
}

export function BookingForm({
  teachers, subjects, error,
}: {
  teachers: Teacher[]
  subjects: Subject[]
  error?:   string
}) {
  const [teacherId,   setTeacherId]   = useState("")
  const [subjectId,   setSubjectId]   = useState("")
  const [modality,    setModality]    = useState("PRESENCIAL")
  const [notes,       setNotes]       = useState("")

  const [availDates,  setAvailDates]  = useState<string[]>([])   // YYYY-MM-DD
  const [selectedDate,setSelectedDate]= useState("")
  const [availSlots,  setAvailSlots]  = useState<string[]>([])
  const [selectedSlot,setSelectedSlot]= useState("")
  const [weekOffset,  setWeekOffset]  = useState(0)
  const [loading,     setLoading]     = useState(false)

  // Busca datas disponíveis quando professor muda
  useEffect(() => {
    if (!teacherId) { setAvailDates([]); setSelectedDate(""); setAvailSlots([]); setSelectedSlot(""); return }
    setLoading(true)
    fetch(`/api/teachers/${teacherId}/slots`)
      .then((r) => r.json())
      .then((d) => { setAvailDates(d.dates ?? []); setSelectedDate(""); setAvailSlots([]); setSelectedSlot("") })
      .finally(() => setLoading(false))
  }, [teacherId])

  // Busca slots quando data muda
  useEffect(() => {
    if (!teacherId || !selectedDate) { setAvailSlots([]); setSelectedSlot(""); return }
    fetch(`/api/teachers/${teacherId}/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => { setAvailSlots(d.slots ?? []); setSelectedSlot("") })
  }, [teacherId, selectedDate])

  // Gera dias da semana visível
  const today   = startOfDay(new Date())
  const weekStart = addDays(today, 1 + weekOffset * 7)
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const preferredAt = selectedDate && selectedSlot
    ? `${selectedDate}T${selectedSlot}:00`
    : ""

  const hasAvailability = teacherId && availDates.length > 0
  const noAvailability  = teacherId && !loading && availDates.length === 0

  return (
    <form action={requestLessonAction} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Hidden inputs */}
      <input type="hidden" name="teacherId"   value={teacherId} />
      <input type="hidden" name="subjectId"   value={subjectId} />
      <input type="hidden" name="preferredAt" value={preferredAt} />
      <input type="hidden" name="modality"    value={modality} />
      <input type="hidden" name="notes"       value={notes} />

      {/* Matéria */}
      <div className="space-y-2">
        <Label>Matéria *</Label>
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Selecione a matéria</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Professor */}
      <div className="space-y-2">
        <Label>Professor *</Label>
        <select value={teacherId} onChange={(e) => { setTeacherId(e.target.value); setWeekOffset(0) }} required
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Selecione o professor</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Calendário de disponibilidade */}
      {teacherId && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Selecione uma data disponível *
          </Label>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando disponibilidade...
            </div>
          )}

          {noAvailability && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-4 py-3 rounded-lg border border-orange-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Este professor ainda não configurou sua disponibilidade. Tente outro professor ou entre em contato.
            </div>
          )}

          {hasAvailability && !loading && (
            <>
              {/* Navegação de semana */}
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                  disabled={weekOffset === 0}
                  className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-muted-foreground font-medium">
                  {format(weekDays[0], "dd MMM", { locale: ptBR })} – {format(weekDays[6], "dd MMM yyyy", { locale: ptBR })}
                </span>
                <button type="button" onClick={() => setWeekOffset((w) => w + 1)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Grid de dias */}
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((day) => {
                  const dateStr  = format(day, "yyyy-MM-dd")
                  const isAvail  = availDates.includes(dateStr)
                  const isSelected = selectedDate === dateStr
                  return (
                    <button
                      key={dateStr} type="button"
                      disabled={!isAvail}
                      onClick={() => { setSelectedDate(dateStr); setSelectedSlot("") }}
                      className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-medium transition-all border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : isAvail
                          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                          : "text-muted-foreground/40 border-transparent cursor-not-allowed"
                      }`}
                    >
                      <span className="text-[10px] uppercase">{DAY_SHORT[day.getDay()]}</span>
                      <span className="text-base font-bold mt-0.5">{format(day, "d")}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Horários disponíveis */}
      {selectedDate && availSlots.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Selecione o horário *
          </Label>
          <div className="flex flex-wrap gap-2">
            {availSlots.map((slot) => (
              <button key={slot} type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedSlot === slot
                    ? "bg-primary text-white border-primary"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && availSlots.length === 0 && !loading && (
        <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg">
          Não há horários disponíveis nesta data. Escolha outro dia.
        </div>
      )}

      {/* Modalidade */}
      <div className="space-y-2">
        <Label>Modalidade *</Label>
        <div className="flex gap-4">
          {[{ value: "PRESENCIAL", label: "Presencial" }, { value: "ONLINE", label: "Online (Meet/Zoom)" }].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="_modality" value={value}
                checked={modality === value}
                onChange={() => setModality(value)} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label>Observações (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: tenho dúvida em equações do 2º grau..." rows={2} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SubmitButton disabled={!preferredAt || !subjectId || !teacherId} />
        {preferredAt && (
          <Badge variant="outline" className="text-xs font-normal">
            {format(new Date(`${selectedDate}T${selectedSlot}:00`), "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
          </Badge>
        )}
      </div>
    </form>
  )
}
