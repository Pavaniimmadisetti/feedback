const pool = require('../config/database');

async function list() {
  const [rows] = await pool.execute(
    `SELECT id, code, course_name, short_name, credits, semester, subject_type, is_active, created_at, updated_at
     FROM courses
     ORDER BY semester ASC, code ASC`
  );
  return rows;
}

async function listBySemesterType(semester, subjectType) {
  const [rows] = await pool.execute(
    `SELECT id, code, course_name, short_name
     FROM courses
     WHERE semester = ? AND subject_type = ? AND is_active = 1
     ORDER BY code ASC`,
    [semester, subjectType]
  );
  return rows;
}

async function create(payload) {
  const [result] = await pool.execute(
    `INSERT INTO courses (code, course_name, short_name, credits, semester, subject_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.code, payload.course_name, payload.short_name, payload.credits, payload.semester, payload.subject_type]
  );
  return result.insertId;
}

async function update(id, payload) {
  await pool.execute(
    `UPDATE courses
     SET code = ?, course_name = ?, short_name = ?, credits = ?, semester = ?, subject_type = ?, is_active = ?
     WHERE id = ?`,
    [
      payload.code,
      payload.course_name,
      payload.short_name,
      payload.credits,
      payload.semester,
      payload.subject_type,
      payload.is_active,
      id
    ]
  );
}

async function remove(id) {
  await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
}

module.exports = {
  list,
  listBySemesterType,
  create,
  update,
  remove
};
