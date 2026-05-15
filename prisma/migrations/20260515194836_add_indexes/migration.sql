-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "lesson_requests_teacherId_status_idx" ON "lesson_requests"("teacherId", "status");

-- CreateIndex
CREATE INDEX "lesson_requests_studentId_status_idx" ON "lesson_requests"("studentId", "status");

-- CreateIndex
CREATE INDEX "lessons_studentId_idx" ON "lessons"("studentId");

-- CreateIndex
CREATE INDEX "lessons_teacherId_idx" ON "lessons"("teacherId");

-- CreateIndex
CREATE INDEX "lessons_status_idx" ON "lessons"("status");

-- CreateIndex
CREATE INDEX "lessons_scheduledAt_idx" ON "lessons"("scheduledAt");

-- CreateIndex
CREATE INDEX "lessons_teacherId_status_scheduledAt_idx" ON "lessons"("teacherId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "payments_studentId_idx" ON "payments"("studentId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_dueDate_idx" ON "payments"("dueDate");
