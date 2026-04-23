-- DropForeignKey
ALTER TABLE "CourseContent" DROP CONSTRAINT "CourseContent_courseFolderId_fkey";

-- DropForeignKey
ALTER TABLE "CourseFolder" DROP CONSTRAINT "CourseFolder_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_studentId_fkey";

-- CreateIndex
CREATE INDEX "Course_instructorId_idx" ON "Course"("instructorId");

-- CreateIndex
CREATE INDEX "Course_level_idx" ON "Course"("level");

-- CreateIndex
CREATE INDEX "CourseContent_courseFolderId_idx" ON "CourseContent"("courseFolderId");

-- CreateIndex
CREATE INDEX "CourseFolder_courseId_idx" ON "CourseFolder"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Student_instructorId_idx" ON "Student"("instructorId");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- AddForeignKey
ALTER TABLE "CourseFolder" ADD CONSTRAINT "CourseFolder_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseContent" ADD CONSTRAINT "CourseContent_courseFolderId_fkey" FOREIGN KEY ("courseFolderId") REFERENCES "CourseFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
