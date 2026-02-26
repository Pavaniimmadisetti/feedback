const express = require('express');
const formController = require('../controllers/formController');
const { requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/ordered', requireRole('admin'), asyncHandler(formController.listOrderedForms));
router.get('/sequence', requireRole('admin'), asyncHandler(formController.listSequenceForms));
router.post('/single', requireRole('admin'), asyncHandler(formController.createSingleForm));
router.post('/bulk-by-section', requireRole('admin'), asyncHandler(formController.createBulkFormsBySection));
router.get('/:id/response-count', requireRole('admin'), asyncHandler(formController.getFormResponseCount));
router.delete('/:id', requireRole('admin'), asyncHandler(formController.deleteForm));

module.exports = router;
