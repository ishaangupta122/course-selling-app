-- 02_sample_data_dml.sql
-- Run this after schema file

-- Admin
INSERT INTO admins (id, name, email, password)
VALUES
  ('adm_001', 'Platform Admin', 'admin@example.com', 'password')
ON CONFLICT (email) DO NOTHING;

-- Instructors (added slug)
INSERT INTO instructors (id, name, email, password, organization, slug)
VALUES
  ('ins_001', 'Alice Instructor', 'alice@example.com', 'password', 'Alice Academy', 'alice-academy'),
  ('ins_002', 'Bob Instructor', 'bob@example.com', 'password', 'Bob Institute', 'bob-institute')
ON CONFLICT (email) DO NOTHING;

-- Students
INSERT INTO students (id, name, email, password, instructor_id)
VALUES
  ('stu_001', 'Sam Student', 'sam@example.com', 'password', 'ins_001'),
  ('stu_002', 'Nina Student', 'nina@example.com', 'password', 'ins_001')
ON CONFLICT (email, instructor_id) DO NOTHING;

-- Courses
INSERT INTO courses (id, instructor_id, title, description, price, thumbnail_url, level, type)
VALUES
  ('cou_001', 'ins_001', 'DBMS Basics', 'Learn relational database fundamentals', 999, 'https://example.com/dbms.jpg', 'BEGINNER', 'RECORDED'),
  ('cou_002', 'ins_001', 'Advanced SQL', 'Deep dive into joins and optimization', 1499, 'https://example.com/sql.jpg', 'ADVANCED', 'LIVE')
ON CONFLICT (id) DO NOTHING;

-- Course Folders
INSERT INTO course_folders (id, name, course_id)
VALUES
  ('fol_001', 'Introduction', 'cou_001')
ON CONFLICT (course_id, name) DO NOTHING;

-- Course Contents
INSERT INTO course_contents (id, name, type, url, course_folder_id)
VALUES
  ('con_001', 'Intro Video', 'VIDEO', 'https://example.com/intro.mp4', 'fol_001'),
  ('con_002', 'Lecture Notes', 'NOTES', 'https://example.com/notes.pdf', 'fol_001')
ON CONFLICT (id) DO NOTHING;

-- Enrollments
INSERT INTO enrollments (id, student_id, course_id)
VALUES
  ('enr_001', 'stu_001', 'cou_001')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Payments
INSERT INTO payments (id, student_id, course_id, amount, currency, razorpay_order_id, razorpay_payment_id, status)
VALUES
  ('pay_001', 'stu_001', 'cou_001', 999, 'INR', 'order_demo_1', 'payment_demo_1', 'SUCCESS')
ON CONFLICT (razorpay_order_id) DO NOTHING;