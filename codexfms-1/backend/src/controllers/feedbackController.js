const feedbackModel = require('../models/feedbackModel');
const { getQuestionsByFeedbackFor, validateFeedbackPayload } = require('../utils/questions');

async function listStudentForms(req, res) {
  const data = await feedbackModel.listForStudent(req.session.user_id);
  return res.json({ data });
}

async function getStudentForm(req, res) {
  const formId = Number(req.params.id);
  const form = await feedbackModel.findVisibleFormForStudent(formId, req.session.user_id);
  if (!form) {
    return res.status(404).json({ message: 'Form not found for this student' });
  }

  const now = new Date();
  const closeTime = new Date(form.closes_at_utc);
  const forcedClosed = form.status_override === 'closed';
  if (now > closeTime || forcedClosed) {
    return res.status(400).json({ message: 'Form is closed' });
  }

  if (form.already_submitted) {
    return res.status(400).json({ message: 'Feedback already submitted for this form' });
  }

  return res.json({
    data: {
      ...form,
      questions: getQuestionsByFeedbackFor(form.feedback_for || 'faculty')
    }
  });
}

async function submitFeedback(req, res) {
  const formId = Number(req.params.id);
  const studentId = req.session.user_id;

  const form = await feedbackModel.findVisibleFormForStudent(formId, studentId);
  if (!form) {
    return res.status(404).json({ message: 'Form not found for this student' });
  }

  const now = new Date();
  const closeTime = new Date(form.closes_at_utc);
  const forcedClosed = form.status_override === 'closed';
  if (now > closeTime || forcedClosed) {
    return res.status(400).json({ message: 'Form is closed' });
  }

  if (form.already_submitted) {
    return res.status(400).json({ message: 'Feedback already submitted for this form' });
  }

  const feedbackFor = form.feedback_for || 'faculty';
  const errors = validateFeedbackPayload(req.body, feedbackFor);
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  await feedbackModel.insertResponse(formId, studentId, req.body, feedbackFor);
  return res.status(201).json({ message: 'Feedback submitted successfully' });
}

module.exports = {
  listStudentForms,
  getStudentForm,
  submitFeedback
};
