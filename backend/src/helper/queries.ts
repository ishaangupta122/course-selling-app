export const SQL = {
  admin: {
    findByEmail: `
      SELECT * FROM admins WHERE email = $1 LIMIT 1
    `,
    create: `
      INSERT INTO admins (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    setInstructorStatus: `
      UPDATE instructors
      SET status = $2
      WHERE id = $1
      RETURNING *
    `,
    getPlatformStats: `
      SELECT * FROM platform_stats_view LIMIT 1
    `,
  },
  instructor: {
    findByEmail: `
      SELECT * FROM instructors WHERE email = $1 LIMIT 1
    `,
    findById: `
      SELECT * FROM instructors WHERE id = $1 LIMIT 1
    `,
    findBySlug: `
      SELECT * FROM instructors WHERE slug = $1 LIMIT 1
    `,
    create: `
      INSERT INTO instructors (id, name, email, password, organization, slug, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
      RETURNING *
    `,
    getStudents: `
      SELECT * FROM students
      WHERE instructor_id = $1
      ORDER BY created_at DESC
    `,
  },
  course: {
    create: `
      INSERT INTO courses (
        id,
        instructor_id,
        title,
        description,
        price,
        thumbnail_url,
        level,
        type,
        start_date,
        end_date,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DRAFT')
      RETURNING *
    `,
    updateByInstructor: `
      UPDATE courses
      SET title = $3,
          description = $4,
          price = $5,
          thumbnail_url = $6,
          level = $7,
          type = $8,
          start_date = $9,
          end_date = $10
      WHERE id = $1 AND instructor_id = $2
      RETURNING *
    `,
    getByInstructorWithCounts: `
      SELECT c.*, COUNT(e.id)::text AS enrollments_count
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'ACTIVE'
      WHERE c.instructor_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,
    findByInstructor: `
      SELECT * FROM courses
      WHERE id = $1 AND instructor_id = $2
      LIMIT 1
    `,
    findById: `
      SELECT * FROM courses WHERE id = $1 LIMIT 1
    `,
    findByInstructorSlug: `
      SELECT * FROM courses
      WHERE instructor_id = $1
      ORDER BY created_at DESC
    `,
    deleteByInstructor: `
      DELETE FROM courses
      WHERE id = $1 AND instructor_id = $2
    `,
    getFoldersByCourseId: `
      SELECT * FROM course_folders
      WHERE course_id = $1
      ORDER BY created_at ASC
    `,
    getContentsByCourseId: `
      SELECT cc.*
      FROM course_contents cc
      INNER JOIN course_folders cf ON cf.id = cc.course_folder_id
      WHERE cf.course_id = $1
      ORDER BY cc.position ASC, cc.created_at ASC
    `,
    findFolderById: `
      SELECT * FROM course_folders WHERE id = $1 LIMIT 1
    `,
    findFolderByCourseAndName: `
      SELECT * FROM course_folders
      WHERE course_id = $1 AND name = $2
      LIMIT 1
    `,
    createFolder: `
      INSERT INTO course_folders (id, name, course_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    getFolderOwnership: `
      SELECT cf.*, c.instructor_id
      FROM course_folders cf
      INNER JOIN courses c ON c.id = cf.course_id
      WHERE cf.id = $1
      LIMIT 1
    `,
    getContentsByFolderId: `
      SELECT * FROM course_contents
      WHERE course_folder_id = $1
      ORDER BY position ASC
    `,
    deleteFolderById: `
      DELETE FROM course_folders WHERE id = $1
    `,
    getContentOwnership: `
      SELECT cc.*, c.instructor_id
      FROM course_contents cc
      INNER JOIN course_folders cf ON cf.id = cc.course_folder_id
      INNER JOIN courses c ON c.id = cf.course_id
      WHERE cc.id = $1
      LIMIT 1
    `,
    deleteContentById: `
      DELETE FROM course_contents WHERE id = $1
    `,
    getContentIdsByFolderId: `
      SELECT id FROM course_contents WHERE course_folder_id = $1
    `,
    updateContentPosition: `
      UPDATE course_contents
      SET position = $1
      WHERE id = $2 AND course_folder_id = $3
    `,
    createContent: `
      INSERT INTO course_contents (id, name, type, url, course_folder_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
  },
  student: {
    findById: `
      SELECT * FROM students WHERE id = $1 LIMIT 1
    `,
    findByEmailAndInstructor: `
      SELECT * FROM students
      WHERE email = $1 AND instructor_id = $2
      LIMIT 1
    `,
    create: `
      INSERT INTO students (id, name, email, password, instructor_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    updateProfile: `
      UPDATE students
      SET name = COALESCE($2, name),
          email = COALESCE($3, email)
      WHERE id = $1
      RETURNING *
    `,
    getProfileByInstructor: `
      SELECT *
      FROM students
      WHERE id = $1 AND instructor_id = $2
      LIMIT 1
    `,
    getEnrollmentsByInstructor: `
      SELECT e.*,
             c.id AS course_id,
             c.instructor_id AS course_instructor_id,
             c.title AS course_title,
             c.description AS course_description,
             c.price AS course_price,
             c.thumbnail_url AS course_thumbnail_url,
             c.level AS course_level,
             c.type AS course_type,
             c.start_date AS course_start_date,
             c.end_date AS course_end_date,
             c.status AS course_status,
             c.created_at AS course_created_at,
             c.updated_at AS course_updated_at
      FROM enrollments e
      INNER JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = $1 AND c.instructor_id = $2
      ORDER BY e.enrolled_at DESC
    `,
    getEnrollment: `
      SELECT * FROM enrollments
      WHERE student_id = $1 AND course_id = $2
      LIMIT 1
    `,
  },
  payment: {
    createOrder: `
      INSERT INTO payments (
        id,
        student_id,
        course_id,
        amount,
        currency,
        razorpay_order_id,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
      RETURNING *
    `,
    markSuccess: `
      UPDATE payments
      SET status = 'SUCCESS',
          razorpay_payment_id = $2
      WHERE razorpay_order_id = $1
    `,
    createEnrollment: `
      INSERT INTO enrollments (id, student_id, course_id, status)
      VALUES ($1, $2, $3, 'ACTIVE')
      RETURNING *
    `,
    markFailed: `
      UPDATE payments
      SET status = 'FAILED'
      WHERE razorpay_order_id = $1
    `,
  },
} as const;
