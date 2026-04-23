-- 04_views_and_triggers.sql
-- Run this file after schema.sql.
-- This file keeps one simple trigger and one simple view.

-- =====================================
-- TRIGGER
-- =====================================
-- This trigger automatically updates updated_at
-- whenever a course record is modified.

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
-- VIEW
-- =====================================
-- This view shows simple platform statistics.

CREATE OR REPLACE VIEW platform_stats_view AS
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
SELECT * FROM platform_stats_view;
