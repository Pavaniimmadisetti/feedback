const express = require('express');
const courseController = require('../controllers/courseController');
const { requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', requireRole('admin'), asyncHandler(courseController.listCourses));
router.get('/filter/options', requireRole('admin'), asyncHandler(courseController.listCoursesBySemesterType));
router.post('/', requireRole('admin'), asyncHandler(courseController.createCourse));
router.put('/:id', requireRole('admin'), asyncHandler(courseController.updateCourse));
router.delete('/:id', requireRole('admin'), asyncHandler(courseController.deleteCourse));

module.exports = router;
