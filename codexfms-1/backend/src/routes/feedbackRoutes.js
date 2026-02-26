const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/forms', requireRole('student'), asyncHandler(feedbackController.listStudentForms));
router.get('/forms/:id', requireRole('student'), asyncHandler(feedbackController.getStudentForm));
router.post('/forms/:id/submit', requireRole('student'), asyncHandler(feedbackController.submitFeedback));

module.exports = router;
