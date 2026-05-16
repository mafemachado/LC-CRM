"use client"

import { useState, useTransition } from "react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { assignHomeworkAction } from "@/lib/actions/homework"
import { Plus, Loader2 } from "lucide-react"

export function AddHomeworkForm({ lessonId }: { lessonId: string }) {
  const [title,       setTitle]       = useState("")
  const [description, setDescription] = useState("")
  const [dueDate,     setDueDate]     = useState("")
  const [pending,     start]          = useTransition()

  const handle = () => {
    if (!title.trim()) return
    start(async () => {
      await assignHomeworkAction(lessonId, title, description || undefined, dueDate || undefined)
      setTitle(""); setDescription(""); setDueDate("")
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="hw-title" className="text-xs">Título da lição *</Label>
        <Input
          id="hw-title"
          placeholder="Ex: Exercícios págs. 45-48"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hw-desc" className="text-xs">Descrição (opcional)</Label>
        <Textarea
          id="hw-desc"
          placeholder="Instruções detalhadas..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hw-due" className="text-xs">Prazo (opcional)</Label>
        <Input
          id="hw-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <Button
        size="sm"
        disabled={pending || !title.trim()}
        onClick={handle}
      >
        {pending
          ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
          : <Plus className="w-4 h-4 mr-2" />}
        Atribuir lição
      </Button>
    </div>
  )
}
