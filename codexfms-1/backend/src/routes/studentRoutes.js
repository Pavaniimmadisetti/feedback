const express = require('express');
const multer = require('multer');
const studentController = require('../controllers/studentController');
const { requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', requireRole('admin'), asyncHandler(studentController.listStudents));
router.get('/me', requireRole('student'), asyncHandler(studentController.getOwnProfile));
router.post('/', requireRole('admin'), asyncHandler(studentController.createStudent));
router.post('/bulk-upload', requireRole('admin'), upload.single('file'), asyncHandler(studentController.bulkUploadStudents));
router.put('/:id', requireRole('admin'), asyncHandler(studentController.updateStudent));
router.delete('/:id', requireRole('admin'), asyncHandler(studentController.deleteStudent));

router.post('/me/password', requireRole('student'), asyncHandler(studentController.changeOwnPassword));

module.exports = router;
