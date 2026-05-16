"use client"

import { useTransition } from "react"
import { Button }        from "@/components/ui/button"
import { deleteMaterialAction } from "@/lib/actions/material"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteMaterialButton({ materialId }: { materialId: string }) {
  const [pending, start] = useTransition()

  const handle = () => {
    if (!window.confirm("Deseja excluir este material?")) return
    start(() => deleteMaterialAction(materialId))
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
      disabled={pending}
      onClick={handle}
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </Button>
  )
}
