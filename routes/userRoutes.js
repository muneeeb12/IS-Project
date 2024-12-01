const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get logged-in user's profile
router.get('/profile', authMiddleware, getUserProfile);

// Update logged-in user's profile
router.put('/profile', authMiddleware, updateUserProfile);

// Get all users (excluding the logged-in user)
router.get('/all', authMiddleware, getAllUsers);

module.exports = router;
