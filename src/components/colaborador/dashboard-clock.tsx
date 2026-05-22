"use client"

import { useState, useEffect } from "react"
import { format }              from "date-fns"
import { ptBR }                from "date-fns/locale"

const FRASES: string[] = [
  "Café tomado, agenda aberta. Hoje vai rolar.",
  "Cada pedido respondido é um responsável a menos no seu ouvido.",
  "Você não é secretária. Você é arquiteta do tempo alheio.",
  "Hoje é o dia em que tudo vai encaixar. Literalmente — encaixe de aulas.",
  "Se o dia parecer caótico, lembre: o caos tem horário marcado aqui.",
  "Você organiza o futuro de muita gente. Sem parar, sem pausa, sem crédito suficiente.",
  "Professores, alunos, responsáveis… você é o único adulto da sala.",
  "Não existe 'amanhã' no agendamento. Só 'agora' e 'atrasado'.",
  "Seu superpoder: fazer três coisas ao mesmo tempo enquanto sorri.",
  "O Google Agenda chora no cantinho vendo o que você faz com esse sistema.",
  "Motivação do dia: responda os pedidos antes que o responsável ligue de novo.",
  "Cada aula confirmada é uma vitória silenciosa. Celebre internamente.",
  "Você já salvou mais horários do que um médico. E sem jaleco.",
  "Dica do dia: se tiver dúvida, confere o horário. Se ainda tiver, confere de novo.",
  "O caos é temporário. A agenda organizada é para sempre.",
  "Hoje tem encaixe possível. Basta encontrá-lo antes do aluno perguntar.",
  "Ser colaborador é saber tudo, aparecer em segundo plano e manter o sorriso.",
  "Um dia de cada vez. E esse dia já começou — melhor ir logo.",
  "Agenda limpa ao final do dia é a melhor forma de terminar o turno.",
  "Você é o fio invisível que mantém tudo conectado. Não deixa partir.",
  "Pedido com +12h parado? Hora de agir antes que vire reclamação.",
  "Paciência com responsável impaciente: recurso renovável, felizmente.",
  "Lembra: o horário não se cria. Ele se negocia.",
  "Se der tudo errado, pelo menos a agenda vai estar organizada.",
  "Você transforma confusão em confirmação. Isso é arte.",
  "Mais um dia servindo à causa da educação. Com muito café.",
  "A aula de hoje que você confirmou muda a semana de alguém.",
  "Produtividade máxima ativada. Ou pelo menos café na mão.",
  "O sistema é complexo. Você é mais.",
  "Cada 'confirmado' seu é um 'ufa!' de um responsável.",
]

function getDailyPhrase(): string {
  const d          = new Date()
  const startOfYear = new Date(d.getFullYear(), 0, 0)
  const dayOfYear  = Math.floor((d.getTime() - startOfYear.getTime()) / 86_400_000)
  return FRASES[dayOfYear % FRASES.length]
}

function getSaudacao(hour: number): string {
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

interface DashboardClockProps {
  firstName:      string
  totalPendentes: number
}

export function DashboardClock({ firstName, totalPendentes }: DashboardClockProps) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(timer)
  }, [])

  if (!now) return null

  const hour      = now.getHours()
  const saudacao  = getSaudacao(hour)
  const timeStr   = format(now, "HH:mm:ss")
  const rawDate   = format(now, "EEEE · dd 'de' MMMM", { locale: ptBR })
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1)
  const phrase    = getDailyPhrase()

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          {dateLabel}
        </p>
        <span
          className="font-mono text-[13px] font-semibold tabular-nums"
          style={{ color: "var(--primary)", fontFeatureSettings: '"tnum"' }}
        >
          {timeStr}
        </span>
      </div>

      <h1 className="font-sub text-[20px] font-semibold leading-snug tracking-[-0.02em]">
        {saudacao}, {firstName}.{" "}
        <span style={{ color: "var(--subtle)" }}>Você tem</span>{" "}
        <span style={{ color: "var(--primary)" }}>{totalPendentes} itens</span>{" "}
        <span style={{ color: "var(--subtle)" }}>pendentes hoje.</span>
      </h1>

      <p
        className="mt-1 text-[12px] italic leading-snug"
        style={{ color: "var(--subtle)" }}
      >
        {phrase}
      </p>
    </div>
  )
}
