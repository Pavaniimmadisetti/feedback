const pool = require('../config/database');

async function list() {
  const [rows] = await pool.execute(
    `SELECT id, registration_no, name, email, dob, section, semester, is_active, created_at, updated_at
     FROM students
     ORDER BY semester ASC, section ASC, registration_no ASC`
  );
  return rows;
}

async function findByRegistrationNo(registrationNo) {
  const [rows] = await pool.execute('SELECT * FROM students WHERE registration_no = ? LIMIT 1', [registrationNo]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(student) {
  const { registration_no, name, email, dob, password_hash, semester, section } = student;
  const [result] = await pool.execute(
    `INSERT INTO students (registration_no, name, email, dob, password_hash, semester, section)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [registration_no, name, email, dob, password_hash, semester, section]
  );
  return result.insertId;
}

async function bulkInsert(rows) {
  if (!rows.length) return;
  const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
  const params = rows.flatMap((row) => [
    row.registration_no,
    row.name,
    row.email,
    row.dob,
    row.password_hash,
    row.semester,
    row.section
  ]);

  await pool.execute(
    `INSERT INTO students (registration_no, name, email, dob, password_hash, semester, section)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       email = VALUES(email),
       dob = VALUES(dob),
       password_hash = VALUES(password_hash),
       semester = VALUES(semester),
       section = VALUES(section),
       is_active = 1`,
    params
  );
}

async function update(id, student) {
  const { name, email, dob, semester, section, is_active } = student;
  await pool.execute(
    `UPDATE students
     SET name = ?, email = ?, dob = ?, semester = ?, section = ?, is_active = ?
     WHERE id = ?`,
    [name, email, dob, semester, section, is_active, id]
  );
}

async function updatePassword(id, passwordHash) {
  await pool.execute('UPDATE students SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

async function remove(id) {
  await pool.execute('DELETE FROM students WHERE id = ?', [id]);
}

module.exports = {
  list,
  findByRegistrationNo,
  findById,
  create,
  bulkInsert,
  update,
  updatePassword,
  remove
};
