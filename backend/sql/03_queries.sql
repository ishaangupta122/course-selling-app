-- DQL --

-- SELECT QUERIES
SELECT * FROM instructors;
SELECT * FROM students;
SELECT * FROM courses;
SELECT * FROM course_folders;
SELECT * FROM course_contents;
SELECT * FROM enrollments;
SELECT * FROM payments;

-- JOIN QUERIES
-- List courses with instructor names
SELECT
  c.id,
  c.title,
  c.price,
  i.name AS instructor_name
FROM courses c
JOIN instructors i ON i.id = c.instructor_id;

-- List enrolled students with course titles
SELECT
  s.name AS student_name,
  c.title AS course_title,
  e.enrolled_at
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id;

-- List folder and content details for a course
SELECT
  cf.name AS folder_name,
  cc.name AS content_name,
  cc.type
FROM course_folders cf
JOIN course_contents cc ON cc.course_folder_id = cf.id
WHERE cf.course_id = 'cou_001';

-- AGGREGATE FUNCTIONS

-- Count total students
SELECT COUNT(*) AS total_students
FROM students;

-- Sum total successful payment amount
SELECT COALESCE(SUM(amount), 0) AS total_revenue
FROM payments
WHERE status = 'SUCCESS';

-- GROUP BY AND HAVING

-- Count enrollments per course
SELECT
  c.id,
  c.title,
  COUNT(e.id) AS total_enrollments
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id, c.title
ORDER BY total_enrollments DESC;

-- Show only courses with at least 1 enrollment
SELECT
  c.id,
  c.title,
  COUNT(e.id) AS total_enrollments
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
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

-- SUBQUERY EXAMPLES

-- Courses priced above average price
SELECT id, title, price
FROM courses
WHERE price > (
  SELECT AVG(price)
  FROM courses
);

-- Students enrolled in any course
SELECT name, email
FROM students
WHERE id IN (
  SELECT student_id
  FROM enrollments
);

-- UPDATE AND DELETE EXAMPLES

-- Update instructor name
UPDATE instructors
SET slug = 'bob'
WHERE id = 'ins_002'
RETURNING id, name;

-- Update course price
UPDATE courses
SET price = 799
WHERE id = 'cou_001'
RETURNING id, title, price;

-- Delete a course content
DELETE FROM course_contents
WHERE id = 'con_002';