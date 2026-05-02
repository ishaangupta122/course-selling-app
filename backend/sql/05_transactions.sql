BEGIN;

-- Step 1: Update payment (only if still pending)
WITH updated_payment AS (
  UPDATE payments
  SET status = 'SUCCESS',
      razorpay_payment_id = 'payment_demo_2'
  WHERE razorpay_order_id = 'order_demo_1'
    AND status = 'PENDING'
  RETURNING student_id, course_id
)

-- Step 2: Insert enrollment ONLY if payment was updated
INSERT INTO enrollments (id, student_id, course_id)
SELECT 
  'enr_002',
  student_id,
  course_id
FROM updated_payment
ON CONFLICT (student_id, course_id) DO NOTHING;

COMMIT;