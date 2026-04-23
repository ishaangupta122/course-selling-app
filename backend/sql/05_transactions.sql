-- 05_transactions.sql
-- This file shows a simple transaction example.
-- Run it after schema, sample data, and views/triggers.

BEGIN;

UPDATE payments
SET status = 'SUCCESS',
    razorpay_payment_id = 'payment_demo_2'
WHERE razorpay_order_id = 'order_demo_1';

INSERT INTO enrollments (id, student_id, course_id, status)
VALUES ('enr_002', 'stu_002', 'cou_001', 'ACTIVE')
ON CONFLICT (student_id, course_id) DO NOTHING;

COMMIT;

-- Check the result
SELECT * FROM payments WHERE razorpay_order_id = 'order_demo_1';
SELECT * FROM enrollments WHERE course_id = 'cou_001';
