"use client"

import { useState } from "react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Plus, Trash2, CreditCard } from "lucide-react"

type PaymentStatus = "PAID" | "PENDING" | "OVERDUE"
type PaymentMethod = "Pix" | "Dinheiro" | "Cartão" | "TED" | "Boleto"

interface PastPayment {
  amount:      string
  dueDate:     string
  paidAt:      string
  status:      PaymentStatus
  method:      PaymentMethod
  description: string
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; cls: string }> = {
  PAID:    { label: "Pago",     cls: "bg-green-100 text-green-700 border-green-300" },
  PENDING: { label: "Pendente", cls: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  OVERDUE: { label: "Vencido",  cls: "bg-red-100 text-red-700 border-red-300" },
}

const STATUS_OPTIONS: PaymentStatus[] = ["PAID", "PENDING", "OVERDUE"]
const METHOD_OPTIONS: PaymentMethod[] = ["Pix", "Dinheiro", "Cartão", "TED", "Boleto"]

function emptyPayment(): PastPayment {
  return {
    amount:      "",
    dueDate:     "",
    paidAt:      "",
    status:      "PAID",
    method:      "Pix",
    description: "",
  }
}

export function PastPaymentsInput({
  onChange,
}: {
  onChange?: (payments: PastPayment[]) => void
}) {
  const [open,     setOpen]     = useState(false)
  const [payments, setPayments] = useState<PastPayment[]>([])

  function updatePayments(next: PastPayment[]) {
    setPayments(next)
    onChange?.(next.filter(p => p.amount && p.dueDate))
  }

  function add()    { updatePayments([...payments, emptyPayment()]) }
  function remove(i: number) { updatePayments(payments.filter((_, idx) => idx !== i)) }
  function update(i: number, field: keyof PastPayment, val: string) {
    updatePayments(payments.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  }

  const valid = payments.filter(p => p.amount && p.dueDate)

  const totalPaid = valid
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(",", ".") || "0"), 0)

  function toggle() {
    if (!open && payments.length === 0) add()
    setOpen(v => !v)
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="pastPayments" value={JSON.stringify(valid)} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium font-sub">Pagamentos anteriores</span>
          <span className="text-xs text-muted-foreground">(opcional)</span>
          {valid.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {valid.length} recibo{valid.length !== 1 ? "s" : ""}
              {totalPaid > 0 && ` · R$ ${totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} pagos`}
            </span>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={toggle}>
          {open ? "Ocultar" : "Adicionar"}
        </Button>
      </div>

      {open && (
        <div className="space-y-3">
          {payments.map((payment, i) => {
            const statusCfg = STATUS_CONFIG[payment.status]
            return (
              <div key={i} className="rounded-xl bg-muted/30 border border-border p-3 space-y-3">
                {/* Status selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update(i, "status", s)}
                      className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                        payment.status === s
                          ? STATUS_CONFIG[s].cls
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {statusCfg.label === "Pago" ? "via" : ""}
                  </span>
                  {payment.status === "PAID" && (
                    <select
                      value={payment.method}
                      onChange={e => update(i, "method", e.target.value)}
                      className="h-7 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Valor */}
                  <div className="space-y-1">
                    <Label className="text-xs">Valor (R$) *</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={payment.amount}
                      onChange={e => update(i, "amount", e.target.value)}
                      placeholder="0,00"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Vencimento */}
                  <div className="space-y-1">
                    <Label className="text-xs">Vencimento *</Label>
                    <Input
                      type="date"
                      value={payment.dueDate}
                      onChange={e => update(i, "dueDate", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Pago em (só se PAID) */}
                  {payment.status === "PAID" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Pago em</Label>
                      <Input
                        type="date"
                        value={payment.paidAt}
                        onChange={e => update(i, "paidAt", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  {/* Referente a */}
                  <div className={`space-y-1 ${payment.status === "PAID" ? "col-span-2" : "col-span-2 sm:col-span-3"}`}>
                    <Label className="text-xs">Referente a</Label>
                    <Input
                      value={payment.description}
                      onChange={e => update(i, "description", e.target.value)}
                      placeholder="Ex: Pacote de 10 aulas — maio/2024"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Remover */}
                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(i)}
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            className="w-full border-dashed"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Adicionar pagamento
          </Button>
        </div>
      )}
    </div>
  )
}
