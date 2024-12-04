const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// Send a new message (POST request)
router.post('/send', authMiddleware, sendMessage);

// Get messages between the authenticated user and the recipient (GET request)
router.get('/:recipient', authMiddleware, getMessages);

module.exports = router;
