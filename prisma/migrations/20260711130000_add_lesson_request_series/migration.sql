-- Série recorrente de pedidos de aula (agendamento semanal do responsável).
ALTER TABLE "lesson_requests" ADD COLUMN "recurrenceSeriesId" TEXT;
ALTER TABLE "lesson_requests" ADD COLUMN "seriesIndex" INTEGER;
ALTER TABLE "lesson_requests" ADD COLUMN "seriesTotal" INTEGER;

CREATE INDEX "lesson_requests_recurrenceSeriesId_idx" ON "lesson_requests"("recurrenceSeriesId");
