-- 02_sample_data_dml.sql
-- Run this file after 01_schema_ddl.sql.
-- It inserts small sample data for testing queries.

INSERT INTO admins (id, name, email, password)
VALUES
  ('adm_001', 'Platform Admin', 'admin@example.com', '$2a$10$replace_me')
ON CONFLICT (email) DO NOTHING;

INSERT INTO instructors (id, name, email, password, organization, slug, status)
VALUES
  ('ins_001', 'Alice Instructor', 'alice@example.com', '$2a$10$replace_me', 'Alice Academy', 'alice-academy', 'ACTIVE'),
  ('ins_002', 'Bob Instructor', 'bob@example.com', '$2a$10$replace_me', 'Bob Institute', 'bob-institute', 'PENDING')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, name, email, password, instructor_id)
VALUES
  ('stu_001', 'Sam Student', 'sam@example.com', '$2a$10$replace_me', 'ins_001'),
  ('stu_002', 'Nina Student', 'nina@example.com', '$2a$10$replace_me', 'ins_001')
ON CONFLICT (email, instructor_id) DO NOTHING;

INSERT INTO courses (id, instructor_id, title, description, price, thumbnail_url, level, type, status)
VALUES
  ('cou_001', 'ins_001', 'DBMS Basics', 'Learn relational database fundamentals', 999, 'https://example.com/dbms.jpg', 'BEGINNER', 'RECORDED', 'PUBLISHED'),
  ('cou_002', 'ins_001', 'Advanced SQL', 'Deep dive into joins and optimization', 1499, 'https://example.com/sql.jpg', 'ADVANCED', 'LIVE', 'DRAFT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_folders (id, name, course_id)
VALUES
  ('fol_001', 'Introduction', 'cou_001')
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO course_contents (id, name, type, url, position, course_folder_id)
VALUES
  ('con_001', 'Intro Video', 'VIDEO', 'https://example.com/intro.mp4', 0, 'fol_001'),
  ('con_002', 'Lecture Notes', 'NOTES', 'https://example.com/notes.pdf', 1, 'fol_001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO enrollments (id, student_id, course_id, status)
VALUES
  ('enr_001', 'stu_001', 'cou_001', 'ACTIVE')
ON CONFLICT (student_id, course_id) DO NOTHING;

INSERT INTO payments (id, student_id, course_id, amount, currency, razorpay_order_id, razorpay_payment_id, status)
VALUES
  ('pay_001', 'stu_001', 'cou_001', 999, 'INR', 'order_demo_1', 'payment_demo_1', 'SUCCESS')
ON CONFLICT (razorpay_order_id) DO NOTHING;
