const bcrypt = require('bcrypt');
const adminModel = require('../models/adminModel');
const studentModel = require('../models/studentModel');
const sessionModel = require('../models/sessionModel');
const { SESSION_COOKIE_NAME, SESSION_TTL_HOURS } = require('../config/constants');
const { generateSessionId } = require('../utils/session');
const { addHours, nowUtcDate } = require('../utils/time');

async function loginStudent(req, res) {
  const { username, password } = req.body;
  const student = await studentModel.findByRegistrationNo(username);

  if (!student || !student.is_active) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const matched = await bcrypt.compare(password, student.password_hash);
  if (!matched) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const sid = generateSessionId();
  const expires = addHours(nowUtcDate(), SESSION_TTL_HOURS);

  await sessionModel.create({
    id: sid,
    user_type: 'student',
    user_id: student.id,
    data_json: { registration_no: student.registration_no },
    expires_at_utc: expires
  });

  res.cookie(SESSION_COOKIE_NAME, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires
  });

  return res.json({
    message: 'Login successful',
    user: {
      id: student.id,
      role: 'student',
      name: student.name,
      registration_no: student.registration_no,
      email: student.email,
      semester: student.semester,
      section: student.section
    }
  });
}

async function loginAdmin(req, res) {
  const { username, password } = req.body;
  const admin = await adminModel.findByUsername(username);

  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const matched = await bcrypt.compare(password, admin.password_hash);
  if (!matched) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const sid = generateSessionId();
  const expires = addHours(nowUtcDate(), SESSION_TTL_HOURS);

  await sessionModel.create({
    id: sid,
    user_type: 'admin',
    user_id: admin.id,
    data_json: { username: admin.username },
    expires_at_utc: expires
  });

  res.cookie(SESSION_COOKIE_NAME, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires
  });

  return res.json({
    message: 'Login successful',
    user: {
      id: admin.id,
      role: 'admin',
      username: admin.username
    }
  });
}

async function logout(req, res) {
  const sid = req.cookies[SESSION_COOKIE_NAME];
  if (sid) {
    await sessionModel.removeById(sid);
  }
  res.clearCookie(SESSION_COOKIE_NAME);
  return res.json({ message: 'Logged out' });
}

module.exports = {
  loginStudent,
  loginAdmin,
  logout
};
