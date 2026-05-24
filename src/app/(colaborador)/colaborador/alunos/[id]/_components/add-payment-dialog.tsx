"use client"

import { useState, useTransition } from "react"
import { useRouter }  from "next/navigation"
import { toast }      from "sonner"
import { addStudentPaymentAction } from "@/lib/actions/colaborador"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"

type PaymentStatus = "PAID" | "PENDING" | "OVERDUE"

const STATUS_OPTIONS: { value: PaymentStatus; label: string; cls: string }[] = [
  { value: "PAID",    label: "Pago",     cls: "bg-green-100 text-green-700 border-green-400" },
  { value: "PENDING", label: "Pendente", cls: "bg-yellow-100 text-yellow-700 border-yellow-400" },
  { value: "OVERDUE", label: "Vencido",  cls: "bg-red-100 text-red-700 border-red-400" },
]

const METHOD_OPTIONS = ["Pix", "Dinheiro", "Cartão", "TED", "Boleto"]

interface AddPaymentDialogProps {
  studentId: string
}

export function AddPaymentDialog({ studentId }: AddPaymentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()

  const today = new Date().toISOString().slice(0, 10)

  const [amount,      setAmount]      = useState("")
  const [dueDate,     setDueDate]     = useState(today)
  const [status,      setStatus]      = useState<PaymentStatus>("PAID")
  const [paidAt,      setPaidAt]      = useState(today)
  const [method,      setMethod]      = useState("Pix")
  const [description, setDescription] = useState("")

  function reset() {
    setAmount(""); setDueDate(today); setStatus("PAID")
    setPaidAt(today); setMethod("Pix"); setDescription("")
  }

  function handleOpen(v: boolean) {
    if (v) reset()
    setOpen(v)
  }

  function submit() {
    const amountNum = parseFloat(amount.replace(",", "."))
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Informe um valor válido")
      return
    }
    if (!dueDate) {
      toast.error("Informe a data de vencimento")
      return
    }
    start(async () => {
      try {
        await addStudentPaymentAction({
          studentId,
          amount:      amountNum,
          dueDate,
          paidAt:      status === "PAID" ? paidAt || dueDate : undefined,
          status,
          method:      method || undefined,
          description: description || undefined,
        })
        toast.success("Pagamento registrado com sucesso")
        setOpen(false)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao registrar pagamento")
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpen(true)}
        className="gap-1.5 h-8 text-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar pagamento
      </Button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sub flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Adicionar Pagamento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Status */}
            <div>
              <Label className="mb-2 block">Status *</Label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      status === opt.value
                        ? opt.cls
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>

            {/* Vencimento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Vencimento *</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>

              {/* Pago em (só se PAID) */}
              {status === "PAID" && (
                <div className="space-y-1.5">
                  <Label>Pago em</Label>
                  <Input type="date" value={paidAt} onChange={e => setPaidAt(e.target.value)} />
                </div>
              )}
            </div>

            {/* Método (só se PAID) */}
            {status === "PAID" && (
              <div className="space-y-1.5">
                <Label>Método</Label>
                <div className="flex flex-wrap gap-2">
                  {METHOD_OPTIONS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                        method === m
                          ? "bg-primary text-white border-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Referente a */}
            <div className="space-y-1.5">
              <Label>Referente a</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Pacote de 10 aulas — maio/2024"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={pending || !amount || !dueDate}>
              {pending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando…</>
                : <><Plus className="w-4 h-4 mr-2" /> Registrar</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
