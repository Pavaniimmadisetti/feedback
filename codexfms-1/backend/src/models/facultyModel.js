const pool = require('../config/database');

async function list() {
  const [rows] = await pool.execute(
    `SELECT id, faculty_code, name, email, department, designation, is_active, created_at, updated_at
     FROM faculty
     ORDER BY name ASC`
  );
  return rows;
}

async function create(payload) {
  const [result] = await pool.execute(
    `INSERT INTO faculty (faculty_code, name, email, department, designation)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.faculty_code, payload.name, payload.email, payload.department, payload.designation]
  );
  return result.insertId;
}

async function update(id, payload) {
  await pool.execute(
    `UPDATE faculty
     SET faculty_code = ?, name = ?, email = ?, department = ?, designation = ?, is_active = ?
     WHERE id = ?`,
    [
      payload.faculty_code,
      payload.name,
      payload.email,
      payload.department,
      payload.designation,
      payload.is_active,
      id
    ]
  );
}

async function remove(id) {
  await pool.execute('DELETE FROM faculty WHERE id = ?', [id]);
}

module.exports = {
  list,
  create,
  update,
  remove
};
