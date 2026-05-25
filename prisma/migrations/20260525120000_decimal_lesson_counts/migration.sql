-- AlterTable: lesson_packages totalLessons e remainingLessons Int → Decimal(5,1)
ALTER TABLE "lesson_packages"
  ALTER COLUMN "totalLessons"     TYPE DECIMAL(5,1),
  ALTER COLUMN "remainingLessons" TYPE DECIMAL(5,1);

-- AlterTable: teacher_payouts totalLessons Int → Decimal(5,1)
ALTER TABLE "teacher_payouts"
  ALTER COLUMN "totalLessons" TYPE DECIMAL(5,1);
