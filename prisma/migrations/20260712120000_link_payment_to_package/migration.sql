-- Vincula a cobrança ao pacote que a originou. Ao excluir o pacote, a cobrança
-- é excluída junto (ON DELETE CASCADE) — corrige a receita "fantasma" no dashboard.
ALTER TABLE "payments" ADD COLUMN "packageId" TEXT;

CREATE INDEX "payments_packageId_idx" ON "payments"("packageId");

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "lesson_packages"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
