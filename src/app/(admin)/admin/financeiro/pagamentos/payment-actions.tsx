"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  markPaymentPaidAction,
  markPaymentOverdueAction,
  deletePaymentAction,
} from "@/lib/actions/financeiro"
import { CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react"

export function PaymentActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition()
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <div className="flex gap-1 items-center">
      {status !== "PAID" && (
        <>
          {status === "PENDING" && (
            <Button
              size="sm" variant="ghost"
              className="text-orange-600 hover:bg-orange-50 text-xs px-2"
              disabled={pending}
              onClick={() => start(() => markPaymentOverdueAction(id) as unknown as void)}
            >
              {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3 mr-1" />}
              Vencido
            </Button>
          )}
          <Button
            size="sm"
            className="text-xs px-2"
            disabled={pending}
            onClick={() => start(() => markPaymentPaidAction(id) as unknown as void)}
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
            Pago
          </Button>
        </>
      )}

      {confirmDel ? (
        <>
          <Button
            size="sm" variant="ghost"
            className="text-xs px-2 text-muted-foreground"
            disabled={pending}
            onClick={() => setConfirmDel(false)}
          >
            Não
          </Button>
          <Button
            size="sm" variant="ghost"
            className="text-xs px-2 text-destructive hover:bg-destructive/10"
            disabled={pending}
            onClick={() => {
              setConfirmDel(false)
              start(() => deletePaymentAction(id) as unknown as void)
            }}
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Excluir"}
          </Button>
        </>
      ) : (
        <Button
          size="sm" variant="ghost"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
          disabled={pending}
          onClick={() => setConfirmDel(true)}
          title="Excluir pagamento"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  )
}
