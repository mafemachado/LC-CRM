-- AlterTable: LessonPackage totalLessons e remainingLessons Int → Decimal(5,1)
ALTER TABLE "LessonPackage"
  ALTER COLUMN "totalLessons"     TYPE DECIMAL(5,1),
  ALTER COLUMN "remainingLessons" TYPE DECIMAL(5,1);

-- AlterTable: TeacherPayout totalLessons Int → Decimal(5,1)
ALTER TABLE "TeacherPayout"
  ALTER COLUMN "totalLessons" TYPE DECIMAL(5,1);
