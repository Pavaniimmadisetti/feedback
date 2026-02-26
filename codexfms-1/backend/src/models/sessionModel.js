const pool = require('../config/database');

async function create(session) {
  const { id, user_type, user_id, data_json, expires_at_utc } = session;
  await pool.execute(
    `INSERT INTO sessions (id, user_type, user_id, data_json, expires_at_utc)
     VALUES (?, ?, ?, ?, ?)`,
    [id, user_type, user_id, JSON.stringify(data_json || {}), expires_at_utc]
  );
}

async function removeById(id) {
  await pool.execute('DELETE FROM sessions WHERE id = ?', [id]);
}

async function removeExpired() {
  await pool.execute('DELETE FROM sessions WHERE expires_at_utc <= UTC_TIMESTAMP()');
}

module.exports = {
  create,
  removeById,
  removeExpired
};
