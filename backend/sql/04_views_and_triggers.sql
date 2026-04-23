-- 04_views_and_triggers.sql
-- Run after schema

-- =====================================
-- TRIGGER
-- =====================================
-- Automatically updates updated_at when a course is modified

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_courses_updated_at ON courses;

CREATE TRIGGER trg_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =====================================
-- VIEW (simple and correct summary)
-- =====================================
-- Provides total instructors, students, courses, and revenue

CREATE OR REPLACE VIEW platform_stats AS
SELECT
  (SELECT COUNT(*) FROM instructors) AS total_instructors,
  (SELECT COUNT(*) FROM students) AS total_students,
  (SELECT COUNT(*) FROM courses) AS total_courses,
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM payments
    WHERE status = 'SUCCESS'
  ) AS total_revenue;

-- Test the view
SELECT * FROM platform_stats;