const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// Send a new message
router.post('/send', authMiddleware, sendMessage);

// Get messages between two users
router.get('/:recipient', authMiddleware, getMessages);

module.exports = router;
