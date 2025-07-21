const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validators = require('../utils/validators');
const auth = require('../middleware/authMiddleware');

// Organization signup
router.post('/register-organization', validators.registerOrganizationValidation, authController.registerOrganization);

// User signup
router.post('/register-user', validators.registerUserValidation, authController.registerUser);

// Login
router.post('/login', validators.loginValidation, authController.login);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Get user profile
router.get('/me', auth, authController.getUserProfile);

// Update user profile  
router.put('/profile', auth, authController.updateUserProfile);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
