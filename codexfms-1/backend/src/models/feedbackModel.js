const pool = require('../config/database');
const { QUESTION_KEYS, buildStoredAnswerMap } = require('../utils/questions');

async function listForStudent(studentId) {
  const [rows] = await pool.execute(
    `SELECT
       f.id,
       f.form_title,
       f.feedback_for,
       f.subject_type,
       f.academic_year,
       f.semester,
       f.section,
       f.feedback_period,
       f.published_at_utc,
       f.closes_at_utc,
       f.status_override,
       c.code AS course_code,
       c.course_name,
       c.short_name,
       fac.name AS faculty_name,
       fr.submitted_at_utc,
       CASE WHEN fr.id IS NULL THEN 'pending' ELSE 'completed' END AS completion_status,
       CASE
         WHEN COALESCE(f.status_override, 'active') = 'closed' OR UTC_TIMESTAMP() > f.closes_at_utc THEN 'closed'
         ELSE 'active'
       END AS form_status
     FROM form_student_targets fst
     INNER JOIN forms f ON f.id = fst.form_id
     INNER JOIN courses c ON c.id = f.course_id
     INNER JOIN faculty fac ON fac.id = f.faculty_id
     LEFT JOIN feedback_responses fr ON fr.form_id = f.id AND fr.student_id = fst.student_id
     WHERE fst.student_id = ?
     ORDER BY f.created_at DESC`,
    [studentId]
  );
  return rows;
}

async function findVisibleFormForStudent(formId, studentId) {
  const [rows] = await pool.execute(
    `SELECT
       f.id,
       f.form_title,
       f.feedback_for,
       f.subject_type,
       f.academic_year,
       f.semester,
       f.section,
       f.feedback_period,
       f.published_at_utc,
       f.closes_at_utc,
       f.status_override,
       c.course_name,
       c.short_name,
       fac.name AS faculty_name,
       EXISTS (
         SELECT 1 FROM feedback_responses fr WHERE fr.form_id = f.id AND fr.student_id = ?
       ) AS already_submitted
     FROM forms f
     INNER JOIN form_student_targets fst ON fst.form_id = f.id
     INNER JOIN courses c ON c.id = f.course_id
     INNER JOIN faculty fac ON fac.id = f.faculty_id
     WHERE f.id = ? AND fst.student_id = ?
     LIMIT 1`,
    [studentId, formId, studentId]
  );

  return rows[0] || null;
}

async function insertResponse(formId, studentId, payload, feedbackFor) {
  const keys = QUESTION_KEYS;
  const normalized = buildStoredAnswerMap(payload, feedbackFor);
  const values = keys.map((key) => normalized[key]);

  const placeholders = keys.map(() => '?').join(', ');
  const [result] = await pool.execute(
    `INSERT INTO feedback_responses (form_id, student_id, ${keys.join(', ')})
     VALUES (?, ?, ${placeholders})`,
    [formId, studentId, ...values]
  );
  return result.insertId;
}

async function countResponsesByForm(formId) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM feedback_responses WHERE form_id = ?',
    [formId]
  );
  return rows[0]?.total || 0;
}

module.exports = {
  listForStudent,
  findVisibleFormForStudent,
  insertResponse,
  countResponsesByForm
};
