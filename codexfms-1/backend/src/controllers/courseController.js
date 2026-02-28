const courseModel = require('../models/courseModel');
const { isValidSemester } = require('../utils/validators');

async function listCourses(req, res) {
  const data = await courseModel.list();
  return res.json({ data });
}

async function createCourse(req, res) {
  const { code, course_name, short_name, credits, semester, subject_type } = req.body;

  if (!code || !course_name || !short_name || !credits || !semester || !subject_type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!isValidSemester(semester)) {
    return res.status(400).json({ message: 'Semester must be from 1 to 8' });
  }
  if (!['core', 'elective'].includes(subject_type)) {
    return res.status(400).json({ message: 'subject_type must be core or elective' });
  }

  const id = await courseModel.create({
    code,
    course_name,
    short_name,
    credits: Number(credits),
    semester: Number(semester),
    subject_type
  });

  return res.status(201).json({ message: 'Course created', id });
}

async function updateCourse(req, res) {
  const { code, course_name, short_name, credits, semester, subject_type, is_active } = req.body;

  if (!isValidSemester(semester)) {
    return res.status(400).json({ message: 'Semester must be from 1 to 8' });
  }

  await courseModel.update(req.params.id, {
    code,
    course_name,
    short_name,
    credits: Number(credits),
    semester: Number(semester),
    subject_type,
    is_active: Boolean(is_active)
  });

  return res.json({ message: 'Course updated' });
}

async function deleteCourse(req, res) {
  await courseModel.remove(req.params.id);
  return res.json({ message: 'Course deleted' });
}

async function listCoursesBySemesterType(req, res) {
  const { semester, subject_type } = req.query;
  if (!isValidSemester(semester) || !['core', 'elective'].includes(subject_type)) {
    return res.status(400).json({ message: 'Invalid semester or subject_type' });
  }
  const data = await courseModel.listBySemesterType(Number(semester), subject_type);
  return res.json({ data });
}

module.exports = {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  listCoursesBySemesterType
};
