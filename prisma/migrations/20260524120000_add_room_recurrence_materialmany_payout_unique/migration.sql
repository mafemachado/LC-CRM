-- ─── RoomType enum ─────────────────────────────────────────────────────────────
CREATE TYPE "RoomType" AS ENUM ('PHYSICAL', 'VIRTUAL');

-- ─── Salas físicas ─────────────────────────────────────────────────────────────
CREATE TABLE "rooms" (
    "id"       TEXT NOT NULL,
    "name"     TEXT NOT NULL,
    "capacity" INTEGER,
    "type"     "RoomType" NOT NULL DEFAULT 'PHYSICAL',
    "active"   BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- ─── Grupos de recorrência ──────────────────────────────────────────────────────
CREATE TABLE "recurrence_groups" (
    "id"        TEXT NOT NULL,
    "rule"      TEXT NOT NULL,
    "startsAt"  TIMESTAMP(3) NOT NULL,
    "endsAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recurrence_groups_pkey" PRIMARY KEY ("id")
);

-- Migrar grupos existentes das aulas para a nova tabela
-- (usa o recurrenceRule da aula mais antiga do grupo como regra canônica)
INSERT INTO "recurrence_groups" ("id", "rule", "startsAt", "createdAt")
SELECT
    g."recurrenceGroupId",
    COALESCE(g."recurrenceRule", 'WEEKLY'),
    g."scheduledAt",
    NOW()
FROM (
    SELECT DISTINCT ON ("recurrenceGroupId")
        "recurrenceGroupId",
        "recurrenceRule",
        "scheduledAt"
    FROM "lessons"
    WHERE "recurrenceGroupId" IS NOT NULL
    ORDER BY "recurrenceGroupId", "scheduledAt" ASC
) g;

-- Adicionar FK de recorrência nas aulas
ALTER TABLE "lessons"
    ADD COLUMN "roomId" TEXT,
    ADD CONSTRAINT "lessons_roomId_fkey"
        FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "lessons_recurrenceGroupId_fkey"
        FOREIGN KEY ("recurrenceGroupId") REFERENCES "recurrence_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remover coluna recurrenceRule das aulas (já migrada para recurrence_groups)
ALTER TABLE "lessons" DROP COLUMN "recurrenceRule";

-- ─── Material → múltiplos alunos ────────────────────────────────────────────────
CREATE TABLE "material_students" (
    "materialId" TEXT NOT NULL,
    "studentId"  TEXT NOT NULL,
    CONSTRAINT "material_students_pkey" PRIMARY KEY ("materialId", "studentId")
);

-- Migrar assignações existentes
INSERT INTO "material_students" ("materialId", "studentId")
SELECT "id", "studentId"
FROM "materials"
WHERE "studentId" IS NOT NULL;

-- FKs da tabela pivot
ALTER TABLE "material_students"
    ADD CONSTRAINT "material_students_materialId_fkey"
        FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "material_students_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "material_students_studentId_idx" ON "material_students"("studentId");

-- Remover coluna studentId de materials (substituída pela tabela pivot)
ALTER TABLE "materials" DROP COLUMN "studentId";

-- ─── TeacherPayout — unique por professor/mês/ano ───────────────────────────────
-- Deduplicar antes: mantém o registro mais recente (maior id lexicográfico = CUID mais novo)
DELETE FROM "teacher_payouts" t1
USING "teacher_payouts" t2
WHERE t1."teacherId" = t2."teacherId"
  AND t1."month"     = t2."month"
  AND t1."year"      = t2."year"
  AND t1."id"        < t2."id";

ALTER TABLE "teacher_payouts"
    ADD CONSTRAINT "teacher_payouts_teacherId_month_year_key"
        UNIQUE ("teacherId", "month", "year");
