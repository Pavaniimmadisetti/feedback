const { nowUtcDate, addHours } = require('../utils/time');
const formModel = require('../models/formModel');
const feedbackModel = require('../models/feedbackModel');
const { validateFormPayload, validateCourseFitsForm } = require('../services/formService');

async function listOrderedForms(req, res) {
  const data = await formModel.listOrdered();
  return res.json({ data });
}

async function listSequenceForms(req, res) {
  const data = await formModel.listSequence();
  return res.json({ data });
}

async function createSingleForm(req, res) {
  const basePayload = {
    form_title: req.body.form_title,
    feedback_for: req.body.feedback_for || 'both',
    subject_type: req.body.subject_type,
    academic_year: req.body.academic_year,
    semester: Number(req.body.semester),
    section: req.body.section || null,
    feedback_period: req.body.feedback_period,
    course_id: Number(req.body.course_id),
    faculty_id: Number(req.body.faculty_id),
    created_by_admin_id: req.session.user_id
  };

  const errors = validateFormPayload(basePayload);
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const validCourse = await validateCourseFitsForm(basePayload.semester, basePayload.subject_type, basePayload.course_id);
  if (!validCourse) {
    return res.status(400).json({ message: 'Selected course does not match semester/subject type' });
  }

  const publishedAt = nowUtcDate();
  const feedbackTypes = basePayload.feedback_for === 'both' ? ['faculty', 'course'] : [basePayload.feedback_for];
  const createdForms = [];
  for (const feedbackFor of feedbackTypes) {
    const payload = {
      ...basePayload,
      feedback_for: feedbackFor,
      published_at_utc: publishedAt,
      closes_at_utc: addHours(publishedAt, 48)
    };
    const created = await formModel.createFormWithTargets(payload);
    createdForms.push({ feedback_for: feedbackFor, ...created });
  }

  return res.status(201).json({
    message: 'Form(s) created',
    forms: createdForms,
    formId: createdForms[0].formId,
    targetCount: createdForms.reduce((sum, item) => sum + Number(item.targetCount || 0), 0)
  });
}

async function createBulkFormsBySection(req, res) {
  const { form_title, feedback_for, subject_type, academic_year, semester, section, feedback_period, assignments } = req.body;

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({ message: 'assignments must contain at least one course-faculty mapping' });
  }

  const feedbackTypes = feedback_for === 'both' || !feedback_for ? ['faculty', 'course'] : [feedback_for];
  const results = [];
  for (const item of assignments) {
    const basePayload = {
      form_title,
      feedback_for: feedback_for || 'both',
      subject_type,
      academic_year,
      semester: Number(semester),
      section: subject_type === 'core' ? section : null,
      feedback_period,
      course_id: Number(item.course_id),
      faculty_id: Number(item.faculty_id),
      created_by_admin_id: req.session.user_id
    };

    const errors = validateFormPayload(basePayload);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const validCourse = await validateCourseFitsForm(basePayload.semester, basePayload.subject_type, basePayload.course_id);
    if (!validCourse) {
      return res.status(400).json({ message: `Course ${basePayload.course_id} does not match semester/subject type` });
    }

    for (const type of feedbackTypes) {
      const publishedAt = nowUtcDate();
      const payload = {
        ...basePayload,
        feedback_for: type,
        published_at_utc: publishedAt,
        closes_at_utc: addHours(publishedAt, 48)
      };
      const created = await formModel.createFormWithTargets(payload);
      results.push({ course_id: payload.course_id, feedback_for: type, ...created });
    }
  }

  return res.status(201).json({ message: 'Bulk forms created', forms: results });
}

async function deleteForm(req, res) {
  const affected = await formModel.deleteForm(req.params.id);
  if (!affected) {
    return res.status(404).json({ message: 'Form not found' });
  }
  return res.json({ message: 'Form and associated feedback deleted' });
}

async function getFormResponseCount(req, res) {
  const total = await feedbackModel.countResponsesByForm(req.params.id);
  return res.json({ form_id: Number(req.params.id), response_count: total });
}

module.exports = {
  listOrderedForms,
  listSequenceForms,
  createSingleForm,
  createBulkFormsBySection,
  deleteForm,
  getFormResponseCount
};
