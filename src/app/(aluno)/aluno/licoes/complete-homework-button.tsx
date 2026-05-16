"use client"

import { useTransition } from "react"
import { Button }        from "@/components/ui/button"
import { completeHomeworkAction } from "@/lib/actions/homework"
import { CheckCircle2, Loader2 } from "lucide-react"

export function CompleteHomeworkButton({ homeworkId }: { homeworkId: string }) {
  const [pending, start] = useTransition()

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => start(() => completeHomeworkAction(homeworkId))}
    >
      {pending
        ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
        : <CheckCircle2 className="w-3 h-3 mr-1.5" />}
      Concluir
    </Button>
  )
}
