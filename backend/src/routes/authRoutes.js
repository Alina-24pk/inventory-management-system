const express = require('express');
const { authController } = require('../controllers');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;