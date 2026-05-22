import {
  HelpCircle, ChevronDown,
  CheckCircle2, Clock, XCircle, UserX, AlertCircle,
  Wifi, Building2, ArrowRight, Plus,
} from "lucide-react"

// ─── Status ──────────────────────────────────────────────────────────────────

const STATUS_ITEMS = [
  {
    bg:    "bg-amber-400",
    ring:  "ring-amber-300",
    label: "Agendada",
    desc:  "Aula registrada pelo colaborador, aguardando o dia da aula",
    icon:  <Clock className="w-3.5 h-3.5 text-amber-700" />,
  },
  {
    bg:    "bg-[#219EBC]",
    ring:  "ring-[#219EBC]/40",
    label: "Confirmada",
    desc:  "Aprovada e confirmada — professor e aluno estão avisados",
    icon:  <CheckCircle2 className="w-3.5 h-3.5 text-[#219EBC]" />,
  },
  {
    bg:    "bg-slate-400",
    ring:  "ring-slate-300",
    label: "Realizada",
    desc:  "Aula ocorreu com sucesso e foi registrada pelo colaborador",
    icon:  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
  },
  {
    bg:    "bg-rose-400",
    ring:  "ring-rose-300",
    label: "Cancelada",
    desc:  "Aula cancelada — saldo devolvido automaticamente ao pacote",
    icon:  <XCircle className="w-3.5 h-3.5 text-rose-500" />,
  },
  {
    bg:    "bg-orange-400",
    ring:  "ring-orange-300",
    label: "Faltou",
    desc:  "Aluno não compareceu — saldo NÃO é devolvido",
    icon:  <UserX className="w-3.5 h-3.5 text-orange-500" />,
  },
] as const

// ─── Fluxo ───────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  {
    key:   "request",
    color: "border-orange-400 bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300",
    dot:   "bg-orange-400",
    label: "Solicitação",
    sub:   "Aluno/responsável pede horário pelo portal",
  },
  {
    key:   "approve",
    color: "border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300",
    dot:   "bg-amber-400",
    label: "Agendada",
    sub:   "Colaborador aprova e registra a aula",
  },
  {
    key:   "confirm",
    color: "border-[#219EBC] bg-blue-50 dark:bg-blue-950/30 text-[#219EBC]",
    dot:   "bg-[#219EBC]",
    label: "Confirmada",
    sub:   "Confirmação enviada por WhatsApp/e-mail",
  },
  {
    key:   "done",
    color: "border-slate-400 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300",
    dot:   "bg-slate-400",
    label: "Realizada",
    sub:   "Colaborador registra a conclusão no dia",
  },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export function AgendaLegend() {
  return (
    <details className="group rounded-xl border border-border bg-card overflow-hidden">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors select-none list-none">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <HelpCircle className="w-4 h-4 text-primary/70" />
          Legenda &amp; Fluxo de Agendamento
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="px-4 pb-5 pt-4 border-t border-border space-y-6">

        {/* ── Status das aulas ─────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Status das aulas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {STATUS_ITEMS.map(s => (
              <div
                key={s.label}
                className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 ring-1 bg-muted/20 ${s.ring}`}
              >
                <span className={`w-2.5 h-2.5 rounded-sm shrink-0 mt-1 ${s.bg}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-snug">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fluxo principal ──────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Fluxo de agendamento
          </p>

          {/* Caminho principal */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Criação direta */}
            <div className="flex items-center gap-1 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1.5">
              <Plus className="w-3 h-3 text-primary/60 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-primary/80 leading-tight">Direto</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Colaborador cria na agenda</p>
              </div>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />

            {FLOW_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-1.5">
                <div className={`rounded-lg border px-2.5 py-1.5 ${step.color}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${step.dot}`} />
                    <p className="text-[11px] font-semibold leading-tight whitespace-nowrap">{step.label}</p>
                  </div>
                  <p className="text-[10px] opacity-70 leading-tight mt-0.5 max-w-[130px]">{step.sub}</p>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Desvios (cancelada / faltou) */}
          <div className="mt-3 flex flex-wrap gap-3 pl-2 border-l-2 border-dashed border-muted-foreground/20">
            <div className="flex items-start gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-600">Cancelada</p>
                <p className="text-[11px] text-muted-foreground">Pode ocorrer a partir de &ldquo;Agendada&rdquo; ou &ldquo;Confirmada&rdquo; — saldo devolvido ao pacote</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UserX className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-orange-600">Faltou</p>
                <p className="text-[11px] text-muted-foreground">Registrado no dia da aula quando o aluno não comparece — saldo não é devolvido</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Indicadores nos blocos ───────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Indicadores nos blocos de aula
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Pills Pct/Alu/Prof */}
            <div className="space-y-2">
              <p className="text-xs font-semibold">Indicadores de confirmação</p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <PillDemo label="Pct" ch="✓" color="var(--success)" bg="var(--success-soft)" />
                    <PillDemo label="Pct" ch="?" color="var(--warn)"    bg="var(--warn-soft)" />
                    <PillDemo label="Pct" ch="!" color="var(--danger)"  bg="var(--danger-soft)" />
                  </div>
                  <span className="text-muted-foreground"><strong>Pct</strong> = Pagamento do pacote</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <PillDemo label="Alu" ch="✓" color="var(--success)" bg="var(--success-soft)" />
                    <PillDemo label="Alu" ch="?" color="var(--warn)"    bg="var(--warn-soft)" />
                  </div>
                  <span className="text-muted-foreground"><strong>Alu</strong> = Confirmação do aluno/responsável</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <PillDemo label="Prof" ch="✓" color="var(--success)" bg="var(--success-soft)" />
                    <PillDemo label="Prof" ch="?" color="var(--warn)"    bg="var(--warn-soft)" />
                  </div>
                  <span className="text-muted-foreground"><strong>Prof</strong> = Confirmação do professor</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1 font-mono text-[10px] font-bold" style={{ color: "var(--success)" }}>
                    <span style={{ background: "var(--success-soft)", borderRadius: 2, padding: "1px 4px" }}>✓</span> ok
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] font-bold" style={{ color: "var(--warn)" }}>
                    <span style={{ background: "var(--warn-soft)", borderRadius: 2, padding: "1px 4px" }}>?</span> pendente
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] font-bold" style={{ color: "var(--danger)" }}>
                    <span style={{ background: "var(--danger-soft)", borderRadius: 2, padding: "1px 4px" }}>!</span> problema
                  </span>
                </div>
              </div>
            </div>

            {/* Modalidade + bloco pendente */}
            <div className="space-y-2">
              <p className="text-xs font-semibold">Modalidade e solicitações</p>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    <Wifi className="w-2.5 h-2.5" /> Online
                  </span>
                  <span className="text-muted-foreground">Aula realizada remotamente (Google Meet ou Zoom)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold bg-muted text-muted-foreground">
                    <Building2 className="w-2.5 h-2.5" /> Sede
                  </span>
                  <span className="text-muted-foreground">Aula presencial na sede do Lição de Casa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-6 rounded border-2 border-dashed border-orange-400 bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                  </div>
                  <span className="text-muted-foreground">
                    Bloco <strong>pontilhado laranja</strong> = solicitação pendente aguardando aprovação do colaborador
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </details>
  )
}

// ─── Mini-pill de exemplo (para a legenda) ────────────────────────────────────

function PillDemo({
  label, ch, color, bg,
}: {
  label: string; ch: string; color: string; bg: string
}) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 2,
        padding: "1px 4px", borderRadius: 2,
        background: bg, color,
        fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {ch} {label}
    </span>
  )
}
