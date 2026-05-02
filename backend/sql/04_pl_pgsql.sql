
-- 1. TRIGGER FUNCTION + TRIGGER

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

-- 2. FUNCTION (Get Total Enrollments)

CREATE OR REPLACE FUNCTION get_total_enrollments(c_id TEXT)
RETURNS INTEGER AS $$
DECLARE total INTEGER;
BEGIN
  SELECT COUNT(*) INTO total
  FROM enrollments
  WHERE course_id = c_id;

  RETURN total;
END;
$$ LANGUAGE plpgsql;

SELECT get_total_enrollments('cou_001');

-- 3. STORED PROCEDURE (Enroll Student)

CREATE OR REPLACE PROCEDURE enroll_student(s_id TEXT, c_id TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = s_id AND course_id = c_id
  ) THEN
    RAISE NOTICE 'Student already enrolled';
  ELSE
    INSERT INTO enrollments (id, student_id, course_id)
    VALUES (gen_random_uuid()::TEXT, s_id, c_id);
  END IF;
END;
$$;

CALL enroll_student('stu_001', 'cou_001');

-- 4. CURSOR (Course-wise Enrollment Count)

DO $$
DECLARE
  rec RECORD;
  cur CURSOR FOR
    SELECT c.title, COUNT(e.id) AS total
    FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id
    GROUP BY c.title;
BEGIN
  OPEN cur;

  LOOP
    FETCH cur INTO rec;
    EXIT WHEN NOT FOUND;

    RAISE NOTICE 'Course: %, Enrollments: %', rec.title, rec.total;
  END LOOP;

  CLOSE cur;
END;
$$;

-- 5. EXCEPTION HANDLING (Safe Payment Insert)

DO $$
BEGIN
  INSERT INTO payments (id, student_id, course_id, amount, razorpay_order_id, status)
  VALUES ('pay_001', 'stu_001', 'cou_001', 1000, 'order_001', 'SUCCESS');

EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate payment detected';
  WHEN others THEN
    RAISE NOTICE 'An unexpected error occurred';
END;
$$;