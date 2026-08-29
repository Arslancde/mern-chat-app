// Purpose: Handle all message-related operations
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a new text message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        // Validate input
        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide receiverId and content'
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // Create message
        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        // Populate sender and receiver info
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username avatar isOnline')
            .populate('receiver', 'username avatar isOnline');

        // Get Socket.IO instance
        const io = req.app.get('io');
        
        // Emit to receiver if they're online (send to their room)
        io.to(receiverId.toString()).emit('new-message', populatedMessage);
        
        // Also emit to sender for confirmation
        io.to(senderId.toString()).emit('message-sent', populatedMessage);

        res.status(201).json({
            success: true,
            data: populatedMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Send audio message - NEW
// @route   POST /api/messages/audio
// @access  Private
const sendAudioMessage = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide receiverId'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please provide audio file'
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // Create audio URL
        const audioUrl = `${req.protocol}://${req.get('host')}/uploads/audio/${req.file.filename}`;

        // Create message with audio
        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: '🎵 Audio message',
            audioUrl: audioUrl
        });

        // Populate sender and receiver info
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username avatar isOnline')
            .populate('receiver', 'username avatar isOnline');

        // Get Socket.IO instance
        const io = req.app.get('io');
        
        // Emit to receiver if they're online
        io.to(receiverId.toString()).emit('new-message', populatedMessage);
        
        // Also emit to sender for confirmation
        io.to(senderId.toString()).emit('message-sent', populatedMessage);

        res.status(201).json({
            success: true,
            data: populatedMessage
        });
    } catch (error) {
        console.error('Send audio message error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Check if user exists
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get messages between current user and other user
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
        .sort({ createdAt: 1 }) // Oldest first
        .populate('sender', 'username avatar isOnline')
        .populate('receiver', 'username avatar isOnline');

        // Mark messages as read
        await Message.updateMany(
            {
                sender: userId,
                receiver: currentUserId,
                isRead: false
            },
            {
                isRead: true,
                readAt: Date.now()
            }
        );

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Get all unique user IDs that the current user has chatted with
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', currentUserId] },
                            '$receiver',
                            '$sender'
                        ]
                    }
                }
            }
        ]);

        // Get user details for each conversation
        const userIds = conversations.map(c => c._id);
        const users = await User.find({
            _id: { $in: userIds }
        }).select('username avatar isOnline lastSeen');

        // Get last message for each conversation
        const conversationsWithLastMessage = await Promise.all(
            users.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { sender: currentUserId, receiver: user._id },
                        { sender: user._id, receiver: currentUserId }
                    ]
                })
                .sort({ createdAt: -1 })
                .select('content audioUrl createdAt isRead');

                // Count unread messages
                const unreadCount = await Message.countDocuments({
                    sender: user._id,
                    receiver: currentUserId,
                    isRead: false
                });

                return {
                    user: {
                        _id: user._id,
                        username: user.username,
                        avatar: user.avatar,
                        isOnline: user.isOnline,
                        lastSeen: user.lastSeen
                    },
                    lastMessage: lastMessage || null,
                    unreadCount: unreadCount
                };
            })
        );

        // Sort by last message date (newest first)
        conversationsWithLastMessage.sort((a, b) => {
            const dateA = a.lastMessage?.createdAt || new Date(0);
            const dateB = b.lastMessage?.createdAt || new Date(0);
            return dateB - dateA;
        });

        res.status(200).json({
            success: true,
            data: conversationsWithLastMessage
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const result = await Message.updateMany(
            {
                sender: userId,
                receiver: currentUserId,
                isRead: false
            },
            {
                isRead: true,
                readAt: Date.now()
            }
        );

        // Emit read receipt via socket
        const io = req.app.get('io');
        if (io) {
            console.log(`📖 Emitting read receipt to ${userId} from ${currentUserId}`);
            io.to(userId.toString()).emit('messages-read', {
                receiverId: currentUserId,
                senderId: userId
            });
        }

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} messages marked as read`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is the sender
        if (message.sender.toString() !== currentUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        await message.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    sendMessage,
    sendAudioMessage,  // ← NEW
    getConversation,
    getConversations,
    markAsRead,
    deleteMessage
};