const pool = require('../config/database');

async function findByUsername(username) {
  const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ? LIMIT 1', [username]);
  return rows[0] || null;
}

async function createDefaultAdmin(username, passwordHash) {
  await pool.execute(
    `INSERT INTO admins (username, password_hash)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE username = username`,
    [username, passwordHash]
  );
}

module.exports = {
  findByUsername,
  createDefaultAdmin
};
