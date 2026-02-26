const pool = require('../config/database');
const { SESSION_COOKIE_NAME } = require('../config/constants');

async function sessionMiddleware(req, res, next) {
  const sid = req.cookies[SESSION_COOKIE_NAME];
  if (!sid) {
    return next();
  }

  const [rows] = await pool.execute(
    `SELECT id, user_type, user_id, data_json, expires_at_utc
     FROM sessions
     WHERE id = ? AND expires_at_utc > UTC_TIMESTAMP()`,
    [sid]
  );

  if (!rows.length) {
    res.clearCookie(SESSION_COOKIE_NAME);
    return next();
  }

  req.session = rows[0];
  return next();
}

module.exports = sessionMiddleware;
