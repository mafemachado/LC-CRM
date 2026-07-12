-- Parcelamento de pagamentos (boleto / cartão de crédito): uma cobrança por parcela
ALTER TABLE "payments" ADD COLUMN "installmentNumber" INTEGER;
ALTER TABLE "payments" ADD COLUMN "installmentTotal" INTEGER;
ALTER TABLE "payments" ADD COLUMN "installmentGroupId" TEXT;

CREATE INDEX "payments_installmentGroupId_idx" ON "payments"("installmentGroupId");
