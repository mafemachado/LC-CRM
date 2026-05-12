import { z } from "zod"

export const lessonRequestSchema = z.object({
  teacherId:   z.string().min(1, "Selecione um professor"),
  subjectId:   z.string().min(1, "Selecione uma matéria"),
  preferredAt: z.string().min(1, "Selecione data e horário"),
  modality:    z.enum(["PRESENCIAL", "ONLINE"]),
  notes:       z.string().optional(),
})

export const lessonCompleteSchema = z.object({
  topicsCovered: z.string().min(1, "Informe o conteúdo da aula"),
  teacherNotes:  z.string().optional(),
})

export type LessonRequestInput  = z.infer<typeof lessonRequestSchema>
export type LessonCompleteInput = z.infer<typeof lessonCompleteSchema>
