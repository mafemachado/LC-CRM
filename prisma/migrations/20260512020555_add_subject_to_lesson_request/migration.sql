-- AddForeignKey
ALTER TABLE "lesson_requests" ADD CONSTRAINT "lesson_requests_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
