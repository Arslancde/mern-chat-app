// Purpose: Main entry point for the backend server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');  // ← ADD THIS

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketio(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (audio uploads) - ADD THIS
app.use('/uploads', express.static('uploads'));

// ✅ Create uploads directory - ADD THIS
if (!fs.existsSync('uploads/audio')) {
    fs.mkdirSync('uploads/audio', { recursive: true });
}

// Connect to database
connectDB();

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Chat API is working!' });
});

// ============================================
// SOCKET.IO REAL-TIME CHAT IMPLEMENTATION
// ============================================

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('user-join', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            onlineUsers.set(userId, socket.id);
            io.emit('user-online', { userId, isOnline: true });
            console.log(`User ${userId} joined their room`);
            console.log('Online users:', Array.from(onlineUsers.keys()));
        }
    });

    socket.on('private-message', async (data) => {
        try {
            const { receiverId, content, senderId } = data;
            
            console.log('Private message received:', { receiverId, content, senderId });
            
            const Message = require('./models/Message');
            const message = await Message.create({
                sender: senderId,
                receiver: receiverId,
                content: content
            });

            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username avatar isOnline')
                .populate('receiver', 'username avatar isOnline');

            console.log('Message saved:', populatedMessage);

            if (onlineUsers.has(receiverId)) {
                console.log(`Sending to receiver ${receiverId}`);
                io.to(receiverId.toString()).emit('new-message', populatedMessage);
            } else {
                console.log(`Receiver ${receiverId} is offline`);
            }

            console.log(`Sending confirmation to sender ${senderId}`);
            io.to(senderId.toString()).emit('message-sent', populatedMessage);

        } catch (error) {
            console.error('Socket message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    socket.on('typing-start', (data) => {
        const { receiverId, senderId, username } = data;
        if (onlineUsers.has(receiverId)) {
            io.to(receiverId.toString()).emit('user-typing', {
                senderId,
                username,
                isTyping: true
            });
        }
    });

    socket.on('typing-stop', (data) => {
        const { receiverId, senderId, username } = data;
        if (onlineUsers.has(receiverId)) {
            io.to(receiverId.toString()).emit('user-typing', {
                senderId,
                username,
                isTyping: false
            });
        }
    });

    socket.on('mark-read', (data) => {
        const { senderId, receiverId } = data;
        console.log(`📖 Marking messages as read from ${senderId} to ${receiverId}`);
        if (onlineUsers.has(senderId)) {
            io.to(senderId.toString()).emit('messages-read', { 
                receiverId: receiverId,
                senderId: senderId
            });
            console.log(`✅ Read receipt sent to ${senderId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit('user-offline', { userId, isOnline: false });
                console.log(`User ${userId} went offline`);
                console.log('Online users:', Array.from(onlineUsers.keys()));
                break;
            }
        }
    });
});

// ============================================
// START THE SERVER
// ============================================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});