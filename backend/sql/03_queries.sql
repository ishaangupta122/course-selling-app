-- 03_queries.sql
-- Run this file after schema and sample data.
-- It contains simple, teacher-friendly query examples.

-- =====================================
-- BASIC SELECT
-- =====================================

SELECT * FROM instructors;

SELECT * FROM courses;

-- =====================================
-- JOIN QUERIES
-- =====================================

-- List courses with instructor names
SELECT
  c.id,
  c.title,
  c.price,
  c.status,
  i.name AS instructor_name
FROM courses c
JOIN instructors i ON i.id = c.instructor_id
ORDER BY c.created_at DESC;

-- List enrolled students with course titles
SELECT
  s.name AS student_name,
  c.title AS course_title,
  e.status,
  e.enrolled_at
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
ORDER BY e.enrolled_at DESC;

-- List folder and content details for a course
SELECT
  cf.name AS folder_name,
  cc.name AS content_name,
  cc.type,
  cc.position
FROM course_folders cf
JOIN course_contents cc ON cc.course_folder_id = cf.id
WHERE cf.course_id = 'cou_001'
ORDER BY cc.position ASC;

-- =====================================
-- AGGREGATE FUNCTIONS
-- =====================================

-- Count total students
SELECT COUNT(*) AS total_students
FROM students;

-- Sum total successful payment amount
SELECT COALESCE(SUM(amount), 0) AS total_revenue
FROM payments
WHERE status = 'SUCCESS';

-- =====================================
-- GROUP BY AND HAVING
-- =====================================

-- Count enrollments per course
SELECT
  c.id,
  c.title,
  COUNT(e.id) AS active_enrollments
FROM courses c
LEFT JOIN enrollments e
  ON e.course_id = c.id
 AND e.status = 'ACTIVE'
GROUP BY c.id, c.title
ORDER BY active_enrollments DESC;

-- Show only courses with at least 1 enrollment
SELECT
  c.id,
  c.title,
  COUNT(e.id) AS active_enrollments
FROM courses c
LEFT JOIN enrollments e
  ON e.course_id = c.id
 AND e.status = 'ACTIVE'
GROUP BY c.id, c.title
HAVING COUNT(e.id) >= 1;

-- Revenue by instructor
SELECT
  i.id,
  i.name,
  COALESCE(SUM(p.amount), 0) AS total_revenue
FROM instructors i
LEFT JOIN courses c ON c.instructor_id = i.id
LEFT JOIN payments p
  ON p.course_id = c.id
 AND p.status = 'SUCCESS'
GROUP BY i.id, i.name
ORDER BY total_revenue DESC;

-- =====================================
-- SUBQUERY EXAMPLES
-- =====================================

-- Courses priced above average price
SELECT id, title, price
FROM courses
WHERE price > (
  SELECT AVG(price)
  FROM courses
);

-- Students enrolled in published courses only
SELECT name, email
FROM students
WHERE id IN (
  SELECT e.student_id
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  WHERE c.status = 'PUBLISHED'
);

-- =====================================
-- SIMPLE UPDATE AND DELETE EXAMPLES
-- =====================================

-- Approve an instructor
UPDATE instructors
SET status = 'ACTIVE'
WHERE id = 'ins_002'
RETURNING id, name, email, status;

-- Publish a course
UPDATE courses
SET status = 'PUBLISHED'
WHERE id = 'cou_002'
RETURNING id, title, status;

-- Example delete (commented for safety)
-- DELETE FROM course_contents
-- WHERE id = 'con_002';
