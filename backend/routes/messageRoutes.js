// Purpose: Message routes for chat functionality
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    sendMessage,
    sendAudioMessage,  // ← NEW
    getConversation,
    getConversations,
    markAsRead,
    deleteMessage
} = require('../controllers/messageController');

// All routes are protected (require authentication)
router.use(protect);

// Send a new text message
router.post('/', sendMessage);

// Send audio message - NEW
router.post('/audio', upload.single('audio'), sendAudioMessage);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get conversation with specific user
router.get('/:userId', getConversation);

// Mark messages as read from specific user
router.put('/read/:userId', markAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

module.exports = router;