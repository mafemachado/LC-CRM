"use client"

import { useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import { Card }   from "@/components/ui/card"
import type { PacoteDigitalizado } from "@/lib/actions/digitalizar"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DadosExtraidos {
  aluno: {
    nome:        string
    ano:         string
    colegio:     string
    contato:     string
    responsavel: string
  }
  pacotes:     PacoteDigitalizado[]
  observacoes: string
  confianca:   "alta" | "media" | "baixa"
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const pacoteSchema = z.object({
  tipo:       z.string(),
  dataInicio: z.string(),
  valor:      z.string(),
  dataFim:    z.string(),
  pagamento:  z.string(),
})

export const revisaoSchema = z.object({
  nome:        z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  ano:         z.string().min(1, "Selecione o ano/série"),
  colegio:     z.string().optional(),
  responsavel: z.string().optional(),
  contato:     z.string().optional(),
  email:       z.string().optional(),
  pacotes:     z.array(pacoteSchema),
})

export type RevisaoForm = z.infer<typeof revisaoSchema>

// ─── Grades ───────────────────────────────────────────────────────────────────

const ANOS = [
  "6º EF", "7º EF", "8º EF", "9º EF",
  "1º EM", "2º EM", "3º EM", "Superior",
]

// ─── Masks ───────────────────────────────────────────────────────────────────

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "")
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "")
}

function maskDate(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

function maskCurrency(v: string) {
  const digits = v.replace(/\D/g, "")
  if (!digits) return ""
  const cents = parseInt(digits, 10)
  const brl   = (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `R$ ${brl}`
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────

function ConfiancaBadge({ confianca, observacoes }: { confianca: "alta"|"media"|"baixa"; observacoes: string }) {
  const map = {
    alta:  { icon: CheckCircle,    color: "text-green-600  bg-green-50  border-green-200",  label: "Leitura realizada com sucesso" },
    media: { icon: AlertTriangle,  color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Revise os campos com atenção" },
    baixa: { icon: XCircle,        color: "text-red-600    bg-red-50    border-red-200",    label: "Imagem difícil de ler — preencha manualmente" },
  }
  const { icon: Icon, color, label } = map[confianca] ?? map.media

  return (
    <div className={`rounded-xl border px-4 py-3 ${color} space-y-1`}>
      <div className="flex items-center gap-2 font-sub font-semibold text-sm">
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </div>
      {observacoes && (
        <p className="text-xs opacity-80 pl-6">{observacoes}</p>
      )}
    </div>
  )
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-sub font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
      {children}
    </h3>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FormularioRevisaoProps {
  dados:         DadosExtraidos
  onSubmit:      (values: RevisaoForm) => Promise<void>
  isSubmitting?: boolean
}

export function FormularioRevisao({ dados, onSubmit, isSubmitting }: FormularioRevisaoProps) {
  const form = useForm<RevisaoForm>({
    resolver: zodResolver(revisaoSchema),
    defaultValues: {
      nome:        dados.aluno.nome,
      ano:         dados.aluno.ano,
      colegio:     dados.aluno.colegio,
      responsavel: dados.aluno.responsavel,
      contato:     dados.aluno.contato,
      email:       "",
      pacotes:     dados.pacotes.length > 0 ? dados.pacotes : [{ tipo: "", dataInicio: "", valor: "", dataFim: "", pagamento: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "pacotes" })

  // Sync if dados change (new scan)
  useEffect(() => {
    form.reset({
      nome:        dados.aluno.nome,
      ano:         dados.aluno.ano,
      colegio:     dados.aluno.colegio,
      responsavel: dados.aluno.responsavel,
      contato:     dados.aluno.contato,
      email:       "",
      pacotes:     dados.pacotes.length > 0 ? dados.pacotes : [{ tipo: "", dataInicio: "", valor: "", dataFim: "", pagamento: "" }],
    })
  }, [dados, form])

  const errors = form.formState.errors

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

      {/* Confidence indicator */}
      <ConfiancaBadge confianca={dados.confianca} observacoes={dados.observacoes} />

      {/* Student data */}
      <Card className="p-5 space-y-4">
        <SectionTitle>Dados do Aluno</SectionTitle>

        {/* Nome */}
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome completo <span className="text-red-500">*</span></Label>
          <Input
            id="nome"
            {...form.register("nome")}
            placeholder="Nome completo do aluno"
            className={errors.nome ? "border-red-400" : ""}
          />
          {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ano */}
          <div className="space-y-1.5">
            <Label htmlFor="ano">Ano/Série <span className="text-red-500">*</span></Label>
            <Controller
              control={form.control}
              name="ano"
              render={({ field }) => (
                <select
                  id="ano"
                  {...field}
                  className={[
                    "w-full h-10 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    errors.ano ? "border-red-400" : "border-input",
                  ].join(" ")}
                >
                  <option value="">Selecione…</option>
                  {ANOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              )}
            />
            {errors.ano && <p className="text-xs text-red-500">{errors.ano.message}</p>}
          </div>

          {/* Colégio */}
          <div className="space-y-1.5">
            <Label htmlFor="colegio">Colégio</Label>
            <Input id="colegio" {...form.register("colegio")} placeholder="Nome do colégio" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Responsável */}
          <div className="space-y-1.5">
            <Label htmlFor="responsavel">Nome do Responsável</Label>
            <Input id="responsavel" {...form.register("responsavel")} placeholder="Nome do responsável" />
          </div>

          {/* Contato */}
          <div className="space-y-1.5">
            <Label htmlFor="contato">Contato/Telefone</Label>
            <Controller
              control={form.control}
              name="contato"
              render={({ field }) => (
                <Input
                  id="contato"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                />
              )}
            />
          </div>
        </div>

        {/* E-mail (optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            E-mail <span className="text-muted-foreground text-xs">(opcional — gerado automaticamente se vazio)</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="aluno@email.com"
          />
        </div>
      </Card>

      {/* Packages */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle>Pacotes de Aulas</SectionTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white"
            onClick={() => append({ tipo: "", dataInicio: "", valor: "", dataFim: "", pagamento: "" })}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Adicionar pacote
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="border border-border rounded-xl p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sub font-semibold text-muted-foreground uppercase">
                  Pacote {idx + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                    title="Remover pacote"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label htmlFor={`pacotes.${idx}.tipo`}>Tipo de Pacote</Label>
                  <Input
                    id={`pacotes.${idx}.tipo`}
                    {...form.register(`pacotes.${idx}.tipo`)}
                    placeholder="Ex: 10 aulas de Matemática"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-1.5">
                  <Label htmlFor={`pacotes.${idx}.valor`}>Valor</Label>
                  <Controller
                    control={form.control}
                    name={`pacotes.${idx}.valor`}
                    render={({ field }) => (
                      <Input
                        id={`pacotes.${idx}.valor`}
                        value={field.value}
                        onChange={(e) => field.onChange(maskCurrency(e.target.value))}
                        placeholder="R$ 0,00"
                        inputMode="numeric"
                      />
                    )}
                  />
                </div>

                {/* Data Início */}
                <div className="space-y-1.5">
                  <Label htmlFor={`pacotes.${idx}.dataInicio`}>Data de Início</Label>
                  <Controller
                    control={form.control}
                    name={`pacotes.${idx}.dataInicio`}
                    render={({ field }) => (
                      <Input
                        id={`pacotes.${idx}.dataInicio`}
                        value={field.value}
                        onChange={(e) => field.onChange(maskDate(e.target.value))}
                        placeholder="dd/mm/aaaa"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    )}
                  />
                </div>

                {/* Data Fim */}
                <div className="space-y-1.5">
                  <Label htmlFor={`pacotes.${idx}.dataFim`}>Data Fim</Label>
                  <Controller
                    control={form.control}
                    name={`pacotes.${idx}.dataFim`}
                    render={({ field }) => (
                      <Input
                        id={`pacotes.${idx}.dataFim`}
                        value={field.value}
                        onChange={(e) => field.onChange(maskDate(e.target.value))}
                        placeholder="dd/mm/aaaa"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    )}
                  />
                </div>

                {/* Pagamento */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`pacotes.${idx}.pagamento`}>Status do Pagamento</Label>
                  <Input
                    id={`pacotes.${idx}.pagamento`}
                    {...form.register(`pacotes.${idx}.pagamento`)}
                    placeholder="Ex: Pago, Pendente, Parcelado…"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base bg-brand-orange hover:bg-[#e07800] text-white font-sub font-semibold"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Salvando…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Confirmar e Cadastrar
          </span>
        )}
      </Button>
    </form>
  )
}
