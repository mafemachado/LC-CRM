"use client"

import { useState, useTransition } from "react"
import { useRouter }    from "next/navigation"
import { toast }        from "sonner"
import { Scan, CheckCircle, Layers, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card }   from "@/components/ui/card"
import { UploadFicha }        from "./upload-ficha"
import { FormularioRevisao }  from "./formulario-revisao"
import type { DadosExtraidos } from "./formulario-revisao"
import type { RevisaoForm }    from "./formulario-revisao"
import { salvarAlunoDigitalizadoAction } from "@/lib/actions/digitalizar"

// ─── States ───────────────────────────────────────────────────────────────────

type Step = "upload" | "analyzing" | "review" | "saved"

interface ImageState {
  base64:   string
  mimeType: string
  preview:  string
}

interface SavedStudent {
  id:   string
  name: string
}

// ─── Duplicate Dialog ─────────────────────────────────────────────────────────

function DuplicateAlert({
  studentName,
  onForce,
  onCancel,
}: {
  studentName: string
  onForce:     () => void
  onCancel:    () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <Card className="p-6 max-w-sm w-full space-y-4">
        <div className="space-y-1">
          <h3 className="font-sub font-semibold text-base">Aluno já cadastrado</h3>
          <p className="text-sm text-muted-foreground">
            Já existe um aluno com nome parecido: <strong>{studentName}</strong>.
            Deseja criar mesmo assim?
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-brand-orange hover:bg-[#e07800] text-white"
            onClick={onForce}
          >
            Criar mesmo assim
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Batch Summary ────────────────────────────────────────────────────────────

function BatchSummary({ saved, onConclude }: { saved: SavedStudent[]; onConclude: () => void }) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <h3 className="font-sub font-semibold">Migração concluída</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {saved.length} {saved.length === 1 ? "aluno cadastrado" : "alunos cadastrados"} nesta sessão:
      </p>
      <ul className="space-y-1">
        {saved.map((s) => (
          <li key={s.id} className="text-sm flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            {s.name}
          </li>
        ))}
      </ul>
      <Button variant="outline" className="w-full" onClick={onConclude}>
        Fechar resumo
      </Button>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DigitalizacaoPage() {
  const router = useRouter()

  const [step,          setStep]         = useState<Step>("upload")
  const [imageState,    setImageState]   = useState<ImageState | null>(null)
  const [dadosExtraidos,setDadosExtraidos] = useState<DadosExtraidos | null>(null)
  const [analyzing,     setAnalyzing]    = useState(false)
  const [isSubmitting,  startSubmit]     = useTransition()
  const [batchMode,     setBatchMode]    = useState(false)
  const [batchSaved,    setBatchSaved]   = useState<SavedStudent[]>([])
  const [showBatchSummary, setShowBatchSummary] = useState(false)

  // Duplicate handling
  const [duplicatePending, setDuplicatePending] = useState<{
    payload: RevisaoForm
    existingName: string
  } | null>(null)

  // ── Image ready from upload ──
  function handleImageReady(base64: string, mimeType: string, preview: string) {
    setImageState({ base64, mimeType, preview })
    setStep("upload")
  }

  // ── Analyze with Claude Vision ──
  async function handleAnalyze() {
    if (!imageState) return
    setAnalyzing(true)
    setStep("analyzing")

    try {
      const res = await fetch("/api/digitalizar-ficha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: imageState.base64, mimeType: imageState.mimeType }),
      })

      const json = await res.json()

      if (!res.ok || !json.sucesso) {
        toast.error(json.error ?? "Não foi possível analisar a ficha.")
        setStep("upload")
        return
      }

      setDadosExtraidos(json.dados as DadosExtraidos)
      setStep("review")
    } catch {
      toast.error("Serviço de leitura indisponível. Preencha manualmente ou tente novamente.")
      setStep("upload")
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Save student ──
  async function handleSave(values: RevisaoForm, force = false) {
    startSubmit(async () => {
      const result = await salvarAlunoDigitalizadoAction(
        {
          nome:        values.nome,
          ano:         values.ano,
          colegio:     values.colegio ?? "",
          responsavel: values.responsavel ?? "",
          contato:     values.contato ?? "",
          email:       values.email ?? "",
          pacotes:     values.pacotes,
        },
        force
      )

      if (result.isDuplicate && !force) {
        setDuplicatePending({ payload: values, existingName: result.studentName ?? values.nome })
        return
      }

      if (!result.sucesso) {
        toast.error(result.error ?? "Erro ao salvar.")
        return
      }

      toast.success(`Aluno ${result.studentName} cadastrado com sucesso!`)

      if (batchMode) {
        setBatchSaved((prev) => [...prev, { id: result.studentId!, name: result.studentName! }])
        resetForNextScan()
      } else {
        router.push(`/colaborador/alunos?success=Aluno+cadastrado+com+sucesso`)
      }
    })
  }

  // ── Form submit handler ──
  async function onFormSubmit(values: RevisaoForm) {
    await handleSave(values, false)
  }

  // ── Force save after duplicate warning ──
  async function handleForce() {
    if (!duplicatePending) return
    const payload = duplicatePending.payload
    setDuplicatePending(null)
    await handleSave(payload, true)
  }

  // ── Reset for next scan (batch mode) ──
  function resetForNextScan() {
    setImageState(null)
    setDadosExtraidos(null)
    setStep("upload")
  }

  // ── Conclude batch ──
  function handleConcludeBatch() {
    setShowBatchSummary(false)
    setBatchSaved([])
    setBatchMode(false)
    resetForNextScan()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Batch mode toggle */}
      <Card className="p-4">
        <label className="flex items-center justify-between cursor-pointer gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-brand-blue" />
            <div>
              <p className="font-sub font-semibold text-sm">Modo Migração em Lote</p>
              <p className="text-xs text-muted-foreground">
                Após salvar, retorna à tela de upload automaticamente
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={batchMode}
            onClick={() => setBatchMode((v) => !v)}
            className={[
              "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
              batchMode ? "bg-brand-blue" : "bg-muted",
            ].join(" ")}
          >
            <span
              className={[
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                batchMode ? "translate-x-5" : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </label>

        {batchMode && batchSaved.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-green-600 font-sub font-semibold">
              ✅ {batchSaved.length} {batchSaved.length === 1 ? "aluno cadastrado" : "alunos cadastrados"} nesta sessão
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBatchSummary(true)}
              className="text-xs"
            >
              Ver resumo
            </Button>
          </div>
        )}
      </Card>

      {/* Batch summary modal */}
      {showBatchSummary && (
        <BatchSummary saved={batchSaved} onConclude={handleConcludeBatch} />
      )}

      {/* Upload + analyze */}
      {(step === "upload" || step === "analyzing") && (
        <Card className="p-5 space-y-5">
          <UploadFicha
            onImageReady={handleImageReady}
            disabled={analyzing}
          />

          {imageState && (
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full h-12 text-base bg-brand-orange hover:bg-[#e07800] text-white font-sub font-semibold"
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analisando ficha com IA…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Analisar Ficha
                </span>
              )}
            </Button>
          )}
        </Card>
      )}

      {/* Review form */}
      {step === "review" && dadosExtraidos && (
        <div className="space-y-4">
          {/* Back to upload */}
          <button
            type="button"
            onClick={resetForNextScan}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nova digitalização
          </button>

          <FormularioRevisao
            dados={dadosExtraidos}
            onSubmit={onFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Batch: after save message (shown briefly via toast, then reset) */}
      {batchMode && step === "upload" && batchSaved.length > 0 && !imageState && (
        <Card className="p-5 text-center space-y-3">
          <p className="text-green-600 font-sub font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Aluno salvo! Digitalize a próxima ficha.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowBatchSummary(true)}
            className="gap-1.5"
          >
            Concluir migração <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      )}

      {/* Duplicate confirmation dialog */}
      {duplicatePending && (
        <DuplicateAlert
          studentName={duplicatePending.existingName}
          onForce={handleForce}
          onCancel={() => setDuplicatePending(null)}
        />
      )}
    </div>
  )
}
