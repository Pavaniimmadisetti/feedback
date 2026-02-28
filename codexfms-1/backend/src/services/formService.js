const { isValidAcademicYear, isValidSemester, isValidSection } = require('../utils/validators');
const courseModel = require('../models/courseModel');

function validateFormPayload(payload) {
  const errors = [];

  if (!payload.form_title || !String(payload.form_title).trim()) {
    errors.push('form_title is required');
  }

  if (!['core', 'elective'].includes(payload.subject_type)) {
    errors.push('subject_type must be core or elective');
  }

  if (!['faculty', 'course', 'both'].includes(payload.feedback_for)) {
    errors.push('feedback_for must be faculty, course, or both');
  }

  if (!isValidAcademicYear(payload.academic_year)) {
    errors.push('academic_year must match YYYY-YY and be successive years');
  }

  if (!isValidSemester(payload.semester)) {
    errors.push('semester must be an integer from 1 to 8');
  }

  if (!['mid-semester', 'end-semester'].includes(payload.feedback_period)) {
    errors.push('feedback_period must be mid-semester or end-semester');
  }

  if (payload.subject_type === 'core' && !isValidSection(payload.section)) {
    errors.push('section must be A/B/C/MIXED for core forms');
  }

  if (payload.subject_type === 'elective') {
    payload.section = null;
  }

  if (!payload.course_id) {
    errors.push('course_id is required');
  }

  if (!payload.faculty_id) {
    errors.push('faculty_id is required');
  }

  return errors;
}

async function validateCourseFitsForm(semester, subjectType, courseId) {
  const courses = await courseModel.listBySemesterType(semester, subjectType);
  return courses.some((course) => course.id === Number(courseId));
}

module.exports = {
  validateFormPayload,
  validateCourseFitsForm
};
