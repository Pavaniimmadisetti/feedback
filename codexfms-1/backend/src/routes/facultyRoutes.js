const express = require('express');
const facultyController = require('../controllers/facultyController');
const { requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', requireRole('admin'), asyncHandler(facultyController.listFaculty));
router.post('/', requireRole('admin'), asyncHandler(facultyController.createFaculty));
router.put('/:id', requireRole('admin'), asyncHandler(facultyController.updateFaculty));
router.delete('/:id', requireRole('admin'), asyncHandler(facultyController.deleteFaculty));

module.exports = router;
