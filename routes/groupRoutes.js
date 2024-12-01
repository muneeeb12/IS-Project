const express = require('express');
const router = express.Router();
const { createGroup, sendGroupMessage, getGroupMessages, getUserGroups } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new group
router.post('/create', authMiddleware, createGroup);

// Send a message to a group
router.post('/send', authMiddleware, sendGroupMessage);

// Get all messages of a group
router.get('/:groupId', authMiddleware, getGroupMessages);

// Route to get all groups the logged-in user is a member of
router.get('/user/groups', authMiddleware, getUserGroups);

module.exports = router;




