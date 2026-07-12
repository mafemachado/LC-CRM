-- Habilita/desabilita a disponibilidade do professor para agendamentos externos.
-- Professores existentes começam desabilitados (DEFAULT false).
ALTER TABLE "teachers" ADD COLUMN "externalBooking" BOOLEAN NOT NULL DEFAULT false;
