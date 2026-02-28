const bcrypt = require('bcrypt');
const { parse } = require('csv-parse/sync');
const studentModel = require('../models/studentModel');
const { isValidSection, isValidSemester } = require('../utils/validators');

async function listStudents(req, res) {
  const students = await studentModel.list();
  return res.json({ data: students });
}

async function getOwnProfile(req, res) {
  const student = await studentModel.findById(req.session.user_id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  return res.json({
    data: {
      id: student.id,
      name: student.name,
      registration_no: student.registration_no,
      email: student.email,
      semester: student.semester,
      section: student.section
    }
  });
}

async function createStudent(req, res) {
  const { registration_no, name, email, dob, section, semester } = req.body;
  if (!registration_no || !name || !email || !dob || !section || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!isValidSection(section) || !isValidSemester(semester)) {
    return res.status(400).json({ message: 'Invalid section or semester' });
  }

  const passwordHash = await bcrypt.hash(dob, 10);
  const id = await studentModel.create({
    registration_no,
    name,
    email,
    dob,
    password_hash: passwordHash,
    section,
    semester: Number(semester)
  });

  return res.status(201).json({ message: 'Student created', id });
}

async function bulkUploadStudents(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'CSV file is required' });
  }

  const records = parse(req.file.buffer.toString('utf8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  if (!records.length) {
    return res.status(400).json({ message: 'CSV file has no data rows' });
  }

  const headerAliases = {
    registration_no: ['registrationno', 'regno'],
    name: ['name', 'studentname'],
    email: ['email', 'mail', 'emailid'],
    date_of_birth: ['dateofbirth', 'dob', 'birthdate'],
    section: ['section', 'sec'],
    semester: ['semester', 'sem']
  };

  const normalizeKey = (value) => String(value || '')
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

  const resolveCanonicalKey = (rawKey) => {
    const normalized = normalizeKey(rawKey);
    for (const [canonical, aliases] of Object.entries(headerAliases)) {
      if (aliases.includes(normalized)) {
        return canonical;
      }
    }
    return null;
  };

  const normalizeRecord = (record) => {
    const normalized = {};
    Object.entries(record).forEach(([key, value]) => {
      const canonical = resolveCanonicalKey(key);
      if (canonical) {
        normalized[canonical] = value;
      }
    });
    return normalized;
  };

  const normalizedRecords = records.map(normalizeRecord);

  const normalizeDate = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(raw)) return raw.replace(/\//g, '-');
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split('-');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    return raw;
  };

  const normalizeSemester = (value) => {
    const text = String(value || '').trim();
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : NaN;
  };

  const requiredColumns = [
    'registration_no',
    'name',
    'email',
    'date_of_birth',
    'section',
    'semester'
  ];

  const header = Object.keys(normalizedRecords[0] || {});
  const missing = requiredColumns.filter((col) => !header.includes(col));
  if (missing.length) {
    return res.status(400).json({ message: `Missing columns: ${missing.join(', ')}` });
  }

  const errors = [];
  const rows = [];

  for (let i = 0; i < normalizedRecords.length; i += 1) {
    const row = normalizedRecords[i];
    const line = i + 2;

    const registration_no = String(row.registration_no || '').trim();
    const name = String(row.name || '').trim();
    const email = String(row.email || '').trim();
    const dob = normalizeDate(row.date_of_birth);
    const section = String(row.section || '').trim().toUpperCase();
    const semester = normalizeSemester(row.semester);

    if (!registration_no || !name || !email || !dob || !section || !semester) {
      errors.push({ line, message: 'Missing required value(s)' });
      continue;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      errors.push({ line, message: 'Invalid date_of_birth format (YYYY-MM-DD)' });
      continue;
    }

    if (!isValidSection(section) || !isValidSemester(semester)) {
      errors.push({ line, message: 'Invalid section or semester' });
      continue;
    }

    const password_hash = await bcrypt.hash(dob, 10);
    rows.push({ registration_no, name, email, dob, section, semester, password_hash });
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  await studentModel.bulkInsert(rows);
  return res.status(201).json({ message: 'Students uploaded', count: rows.length });
}

async function updateStudent(req, res) {
  const { id } = req.params;
  const { name, email, dob, section, semester, is_active } = req.body;
  if (!name || !email || !dob || !section || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!isValidSection(section) || !isValidSemester(semester)) {
    return res.status(400).json({ message: 'Invalid section or semester' });
  }

  await studentModel.update(id, {
    name,
    email,
    dob,
    section,
    semester: Number(semester),
    is_active: Boolean(is_active)
  });

  return res.json({ message: 'Student updated' });
}

async function deleteStudent(req, res) {
  await studentModel.remove(req.params.id);
  return res.json({ message: 'Student deleted' });
}

async function changeOwnPassword(req, res) {
  const studentId = req.session.user_id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password || String(new_password).length < 6) {
    return res.status(400).json({ message: 'Invalid password input' });
  }

  const student = await studentModel.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const matched = await bcrypt.compare(current_password, student.password_hash);
  if (!matched) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(new_password, 10);
  await studentModel.updatePassword(studentId, passwordHash);

  return res.json({ message: 'Password changed successfully' });
}

module.exports = {
  listStudents,
  getOwnProfile,
  createStudent,
  bulkUploadStudents,
  updateStudent,
  deleteStudent,
  changeOwnPassword
};
