"use client"

import { useState } from "react"
import { ModoBadge } from "@/components/shared/modo-badge"
import Link          from "next/link"

type AlunoRow = {
  id:        string
  name:      string
  initials:  string
  grade:     string
  aulas:     number
  lastAula:  string
  content:   string
  modo:      "sede" | "online"
  tag:       string
  tagColor:  "success" | "warn" | "danger" | "muted"
}

type LicaoRow = {
  id:            string
  titulo:        string
  aluno:         string
  alunoInitials: string
  tipo:          "lição" | "resumo" | "material"
  enviado:       string
  status:        "feito" | "pendente"
  sub:           string
}

interface Props {
  alunos: AlunoRow[]
  licoes: LicaoRow[]
  totalAlunos: number
}

const TAG_STYLE: Record<string, { bg: string; color: string }> = {
  success: { bg: "var(--success-soft)", color: "var(--success)" },
  warn:    { bg: "var(--warn-soft)",    color: "var(--warn)"    },
  danger:  { bg: "var(--danger-soft)",  color: "var(--danger)"  },
  muted:   { bg: "var(--muted-soft)",   color: "var(--muted)"   },
}

const TIPO_STYLE: Record<string, { bg: string; color: string }> = {
  "lição":    { bg: "var(--accent-soft)", color: "var(--accent-ink)" },
  "resumo":   { bg: "var(--info-soft)",   color: "var(--info)"       },
  "material": { bg: "var(--muted-soft)",  color: "var(--text-2)"     },
}

const STATUS_STYLE = {
  feito:    { bg: "var(--success-soft)", color: "var(--success)", label: "✓ feito"    },
  pendente: { bg: "var(--warn-soft)",    color: "var(--warn)",    label: "○ pendente" },
}

export function MeusAlunos({ alunos, licoes, totalAlunos }: Props) {
  const [tab, setTab] = useState<"alunos" | "licoes">("alunos")

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden rounded-[10px] border border-border bg-card"
    >
      {/* Tab header */}
      <div className="flex items-center justify-between gap-3 p-[12px_14px_8px]">
        <div
          className="flex gap-[2px] rounded-[7px] border border-border p-[2px]"
          style={{ background: "var(--bg)" }}
        >
          {(["alunos", "licoes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="inline-flex items-center gap-1.5 rounded-[5px] px-3 py-[5px] text-[12px] font-medium transition-colors"
              style={{
                background: tab === t ? "var(--card)" : "transparent",
                color:      tab === t ? "var(--text)"  : "var(--muted)",
                fontWeight: tab === t ? 600 : 400,
                boxShadow:  tab === t ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {t === "alunos" ? "Meus alunos" : "Lições & materiais"}
              <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                {t === "alunos" ? totalAlunos : licoes.length}
              </span>
            </button>
          ))}
        </div>
        {tab === "licoes" && (
          <Link
            href="/professor/materiais"
            className="rounded-[5px] px-[10px] py-[5px] text-[11.5px] font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            + Enviar material
          </Link>
        )}
      </div>

      {/* Alunos table */}
      {tab === "alunos" && (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                <th className="border-b border-border px-[14px] py-[8px] font-medium">Aluno</th>
                <th className="border-b border-border px-[14px] py-[8px] font-medium">Conteúdo atual</th>
                <th className="border-b border-border px-[14px] py-[8px] text-center font-medium">Pacote</th>
                <th className="border-b border-border px-[14px] py-[8px] font-medium">Última aula</th>
                <th className="border-b border-border px-[14px] py-[8px] font-medium">Modo</th>
                <th className="border-b border-border px-[14px] py-[8px] text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-[14px] py-8 text-center text-[12px] text-muted-foreground">
                    Nenhum aluno ainda
                  </td>
                </tr>
              ) : (
                alunos.map((a) => {
                  const tc = TAG_STYLE[a.tagColor]
                  return (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-[14px] py-[9px]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-semibold"
                            style={{ background: "var(--card-2)", color: "var(--text-2)" }}
                          >
                            {a.initials}
                          </div>
                          <div className="leading-[1.25]">
                            <div className="font-medium">{a.name}</div>
                            <div className="text-[10.5px] text-muted-foreground">{a.grade}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[14px] py-[9px] max-w-[180px] truncate" style={{ color: "var(--text-2)" }}>
                        {a.content}
                      </td>
                      <td className="px-[14px] py-[9px] text-center font-mono text-[11px]">
                        {a.aulas}/12
                      </td>
                      <td className="px-[14px] py-[9px]">
                        <span className="text-muted-foreground">{a.lastAula}</span>
                        {(a.tag === "Renovar" || a.tag === "Atenção") && (
                          <span
                            className="ml-1.5 rounded-[2px] px-[4px] py-px font-mono text-[9px] font-bold"
                            style={{ background: tc.bg, color: tc.color }}
                          >
                            {a.tag}
                          </span>
                        )}
                      </td>
                      <td className="px-[14px] py-[9px]">
                        <ModoBadge modo={a.modo} size="sm" />
                      </td>
                      <td className="px-[14px] py-[9px] text-right whitespace-nowrap">
                        <Link
                          href="/professor/materiais"
                          className="text-[11px] font-medium transition-opacity hover:opacity-70"
                          style={{ color: "var(--primary)" }}
                        >
                          + Lição
                        </Link>
                        <span className="mx-2 text-muted-foreground">·</span>
                        <Link
                          href={`/professor/agenda`}
                          className="text-[11px] font-medium text-muted-foreground transition-opacity hover:opacity-70"
                        >
                          perfil →
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Lições table */}
      {tab === "licoes" && (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                <th className="border-b border-border px-[14px] py-[8px] font-medium">Aluno · material</th>
                <th className="border-b border-border px-[14px] py-[8px] font-medium">Tipo</th>
                <th className="border-b border-border px-[14px] py-[8px] font-medium">Enviado</th>
                <th className="border-b border-border px-[14px] py-[8px] text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {licoes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-[14px] py-8 text-center text-[12px] text-muted-foreground">
                    Nenhuma lição enviada ainda
                  </td>
                </tr>
              ) : (
                licoes.map((l) => {
                  const tp = TIPO_STYLE[l.tipo] ?? TIPO_STYLE["lição"]
                  const ss = STATUS_STYLE[l.status]
                  return (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-[14px] py-[9px]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-semibold"
                            style={{ background: "var(--card-2)", color: "var(--text-2)" }}
                          >
                            {l.alunoInitials}
                          </div>
                          <div className="min-w-0 leading-[1.25]">
                            <div className="max-w-[280px] truncate font-medium">{l.titulo}</div>
                            <div className="text-[10.5px] text-muted-foreground">{l.aluno}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[14px] py-[9px]">
                        <span
                          className="rounded-[4px] px-[7px] py-[2px] font-mono text-[10.5px]"
                          style={{ background: tp.bg, color: tp.color }}
                        >
                          {l.tipo}
                        </span>
                      </td>
                      <td className="px-[14px] py-[9px]">
                        <div className="text-muted-foreground">{l.enviado}</div>
                        <div className="text-[10.5px]" style={{ color: "var(--subtle)" }}>{l.sub}</div>
                      </td>
                      <td className="px-[14px] py-[9px] text-right">
                        <span
                          className="rounded-[4px] px-[7px] py-[2px] font-mono text-[10.5px]"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          {ss.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
