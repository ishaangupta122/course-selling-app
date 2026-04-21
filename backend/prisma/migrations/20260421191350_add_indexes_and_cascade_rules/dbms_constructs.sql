-- ============================================================
-- DBMS Project: Course Selling App
-- Course: UCS310 – Database Management Systems
-- ============================================================
-- This file adds:
--   1. CHECK constraint  → Course.price must be >= 0
--   2. VIEW              → enrolled_course_details
--   3. FUNCTION          → get_enrollment_count(course_id)
--   4. STORED PROCEDURE  → enroll_student(student_id, course_id)
--   5. TRIGGER           → auto-update Course.updatedAt on UPDATE
-- ============================================================


-- ------------------------------------------------------------
-- 1. CHECK CONSTRAINT
-- Ensures course price is never negative.
-- ------------------------------------------------------------
ALTER TABLE "Course"
    ADD CONSTRAINT chk_course_price_non_negative CHECK (price >= 0);


-- ------------------------------------------------------------
-- 2. VIEW: enrolled_course_details
-- Joins Enrollment, Student, and Course into one readable view.
-- Useful for reports and viva demos.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW enrolled_course_details AS
SELECT
    e.id             AS enrollment_id,
    e."enrolledAt",
    s.id             AS student_id,
    s.name           AS student_name,
    s.email          AS student_email,
    c.id             AS course_id,
    c.title          AS course_title,
    c.price          AS course_price,
    c.level          AS course_level
FROM "Enrollment" e
JOIN "Student" s ON e."studentId" = s.id
JOIN "Course"  c ON e."courseId"  = c.id;


-- ------------------------------------------------------------
-- 3. FUNCTION: get_enrollment_count
-- Returns the number of students enrolled in a given course.
-- Usage: SELECT get_enrollment_count('course-id-here');
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_enrollment_count(p_course_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM "Enrollment"
    WHERE "courseId" = p_course_id;

    RETURN v_count;
END;
$$;


-- ------------------------------------------------------------
-- 4. STORED PROCEDURE: enroll_student
-- Enrolls a student in a course after checking for duplicates.
-- Usage: CALL enroll_student('student-id', 'course-id');
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE enroll_student(
    p_student_id TEXT,
    p_course_id  TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Check if already enrolled
    IF EXISTS (
        SELECT 1 FROM "Enrollment"
        WHERE "studentId" = p_student_id
          AND "courseId"  = p_course_id
    ) THEN
        RAISE EXCEPTION 'Student % is already enrolled in course %', p_student_id, p_course_id;
    END IF;

    -- Insert new enrollment
    INSERT INTO "Enrollment" (id, "studentId", "courseId", "enrolledAt")
    VALUES (gen_random_uuid()::TEXT, p_student_id, p_course_id, NOW());

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Enrollment already exists (unique constraint violated)';
END;
$$;


-- ------------------------------------------------------------
-- 5. TRIGGER: auto-update Course.updatedAt on every UPDATE
-- PostgreSQL does not auto-update timestamp columns,
-- so this trigger handles it at the database level.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_course_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_course_updated_at
BEFORE UPDATE ON "Course"
FOR EACH ROW
EXECUTE FUNCTION set_course_updated_at();
