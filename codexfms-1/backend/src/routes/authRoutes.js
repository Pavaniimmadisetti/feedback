const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/student/login', asyncHandler(authController.loginStudent));
router.post('/admin/login', asyncHandler(authController.loginAdmin));
router.post('/logout', asyncHandler(authController.logout));

module.exports = router;
