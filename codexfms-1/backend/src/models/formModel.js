const pool = require('../config/database');

async function listSequence() {
  const [rows] = await pool.execute(
    `SELECT
       f.id,
       f.form_title,
       f.feedback_for,
       f.subject_type,
       f.academic_year,
       f.semester,
       COALESCE(f.section, 'Elective') AS section_label,
       f.feedback_period,
       f.published_at_utc,
       f.closes_at_utc,
       f.status_override,
       c.course_name,
       c.short_name,
       fac.name AS faculty_name,
       COUNT(fr.id) AS response_count
     FROM forms f
     INNER JOIN courses c ON c.id = f.course_id
     INNER JOIN faculty fac ON fac.id = f.faculty_id
     LEFT JOIN feedback_responses fr ON fr.form_id = f.id
     GROUP BY f.id
     ORDER BY f.created_at DESC`
  );
  return rows;
}

async function listOrdered() {
  const [rows] = await pool.execute(
    `SELECT
       f.id,
       f.form_title,
       f.feedback_for,
       f.subject_type,
       f.academic_year,
       f.semester,
       COALESCE(f.section, 'Elective') AS section_label,
       f.feedback_period,
       f.published_at_utc,
       f.closes_at_utc,
       f.status_override,
       c.course_name,
       c.short_name,
       fac.name AS faculty_name,
       COUNT(fr.id) AS response_count
     FROM forms f
     INNER JOIN courses c ON c.id = f.course_id
     INNER JOIN faculty fac ON fac.id = f.faculty_id
     LEFT JOIN feedback_responses fr ON fr.form_id = f.id
     GROUP BY f.id
     ORDER BY f.academic_year DESC, f.semester ASC, section_label ASC, f.created_at DESC`
  );
  return rows;
}

async function createFormTx(connection, payload) {
  const [result] = await connection.execute(
    `INSERT INTO forms
      (form_title, feedback_for, subject_type, academic_year, semester, section, feedback_period, course_id, faculty_id,
       published_at_utc, closes_at_utc, created_by_admin_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.form_title,
      payload.feedback_for,
      payload.subject_type,
      payload.academic_year,
      payload.semester,
      payload.section,
      payload.feedback_period,
      payload.course_id,
      payload.faculty_id,
      payload.published_at_utc,
      payload.closes_at_utc,
      payload.created_by_admin_id
    ]
  );
  return result.insertId;
}

async function assignTargetsTx(connection, formId, semester, section, subjectType) {
  let rows;
  if (subjectType === 'core') {
    if (section === 'MIXED') {
      [rows] = await connection.execute(
        `SELECT id FROM students WHERE semester = ? AND is_active = 1`,
        [semester]
      );
    } else {
      [rows] = await connection.execute(
        `SELECT id FROM students WHERE semester = ? AND section = ? AND is_active = 1`,
        [semester, section]
      );
    }
  } else {
    [rows] = await connection.execute(
      `SELECT id FROM students WHERE semester = ? AND is_active = 1`,
      [semester]
    );
  }

  if (!rows.length) {
    return 0;
  }

  const placeholders = rows.map(() => '(?, ?)').join(',');
  const params = rows.flatMap((row) => [formId, row.id]);

  await connection.execute(
    `INSERT INTO form_student_targets (form_id, student_id) VALUES ${placeholders}`,
    params
  );

  return rows.length;
}

async function createFormWithTargets(payload) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const formId = await createFormTx(connection, payload);
    const targetCount = await assignTargetsTx(
      connection,
      formId,
      payload.semester,
      payload.section,
      payload.subject_type
    );
    await connection.commit();
    return { formId, targetCount };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteForm(formId) {
  const [result] = await pool.execute('DELETE FROM forms WHERE id = ?', [formId]);
  return result.affectedRows;
}

module.exports = {
  listSequence,
  listOrdered,
  createFormWithTargets,
  deleteForm
};
