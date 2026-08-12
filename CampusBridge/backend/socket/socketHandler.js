const Message = require('../models/Message');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map(); // Map<userId, socketId>

const setupSocket = (io) => {
    // Authentication middleware for Socket.io
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            socket.user = await User.findById(decoded.id).select('-password');
            if (!socket.user) return next(new Error('User not found'));
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        onlineUsers.set(userId, socket.id);

        // Broadcast online status
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));

        console.log(`User connected: ${socket.user.name}`);

        // Join college room and user room
        socket.join(`college_${socket.user.collegeId}`);
        socket.join(userId);

        // Handle sending messages
        socket.on('sendMessage', async (data) => {
            try {
                const { receiverId, message } = data;

                // College isolation check
                const receiver = await User.findById(receiverId);
                if (!receiver || receiver.collegeId.toString() !== socket.user.collegeId.toString()) {
                    return socket.emit('error', { message: 'Cannot message users from different college' });
                }

                const newMessage = await Message.create({
                    senderId: socket.user._id,
                    receiverId,
                    collegeId: socket.user.collegeId,
                    message
                });

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receiveMessage', {
                        ...newMessage.toObject(),
                        senderName: socket.user.name,
                        senderPhoto: socket.user.profilePhoto
                    });
                }

                // Create notification
                await Notification.create({
                    userId: receiverId,
                    type: 'MESSAGE',
                    content: `New message from ${socket.user.name}`,
                    link: `/chat/${socket.user._id}`
                });

                socket.emit('messageSent', newMessage);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('userTyping', { userId: userId });
            }
        });

        socket.on('stopTyping', (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('userStopTyping', { userId: userId });
            }
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
            console.log(`User disconnected: ${socket.user.name}`);
        });
    });
};

module.exports = setupSocket;
