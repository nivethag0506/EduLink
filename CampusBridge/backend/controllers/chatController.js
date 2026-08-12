const Message = require('../models/Message');

// GET /api/chat/:userId — chat history between current user and :userId
const getChatHistory = async (req, res) => {
    try {
        const messages = await Message.find({
            collegeId: req.user.collegeId,
            $or: [
                { senderId: req.user._id, receiverId: req.params.userId },
                { senderId: req.params.userId, receiverId: req.user._id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/chat — list of conversations (unique users)
const getConversations = async (req, res) => {
    try {
        const messages = await Message.aggregate([
            { $match: { collegeId: req.user.collegeId, $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ['$senderId', req.user._id] }, '$receiverId', '$senderId']
                    },
                    lastMessage: { $first: '$message' },
                    lastDate: { $first: '$createdAt' }
                }
            }
        ]);
        // Populate user info
        const User = require('../models/User');
        const populated = await Promise.all(
            messages.map(async (m) => {
                const user = await User.findById(m._id).select('name profilePhoto role');
                return { user, lastMessage: m.lastMessage, lastDate: m.lastDate };
            })
        );
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getChatHistory, getConversations };
