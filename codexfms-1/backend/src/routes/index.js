const express = require('express');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const facultyRoutes = require('./facultyRoutes');
const courseRoutes = require('./courseRoutes');
const formRoutes = require('./formRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/students', requireAuth, studentRoutes);
router.use('/admin/students', requireAuth, studentRoutes);
router.use('/admin/faculty', requireAuth, facultyRoutes);
router.use('/admin/courses', requireAuth, courseRoutes);
router.use('/admin/forms', requireAuth, formRoutes);
router.use('/student', requireAuth, feedbackRoutes);

module.exports = router;
