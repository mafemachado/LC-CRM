-- CreateTable
CREATE TABLE "monthly_goals" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "revenueGoal" DECIMAL(10,2),
    "lessonsGoal" INTEGER,
    "studentsGoal" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_goals_year_month_key" ON "monthly_goals"("year", "month");
