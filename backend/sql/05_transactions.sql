-- 05_transactions.sql
-- Run after schema, data, and views

BEGIN;

-- Step 1: Update payment status (only if still pending)
UPDATE payments
SET status = 'SUCCESS',
    razorpay_payment_id = 'payment_demo_2'
WHERE razorpay_order_id = 'order_demo_1'
  AND status = 'PENDING';

-- Step 2: Create enrollment (if not already exists)
INSERT INTO enrollments (id, student_id, course_id)
VALUES ('enr_002', 'stu_002', 'cou_001')
ON CONFLICT (student_id, course_id) DO NOTHING;

COMMIT;

-- Check results
SELECT * FROM payments WHERE razorpay_order_id = 'order_demo_1';
SELECT * FROM enrollments WHERE course_id = 'cou_001';