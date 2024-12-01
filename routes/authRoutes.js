const express = require('express');
const router = express.Router();
const { register, verifyOTP, login } = require('../controllers/authController');

// User registration (send OTP)
router.post('/register', register);

// Verify OTP and complete registration
router.post('/verifyOTP', verifyOTP);

// User login
router.post('/login', login);

module.exports = router;
