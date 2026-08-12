const User = require('../models/User');

// GET /api/users/profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
            .populate('collegeId')
            .populate('followers', 'name profilePhoto role')
            .populate('following', 'name profilePhoto role')
            .populate('followRequests', 'name profilePhoto role');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
            .populate('collegeId')
            .populate('followers', 'name profilePhoto role')
            .populate('following', 'name profilePhoto role')
            .populate('followRequests', 'name profilePhoto role');
        if (!user) return res.status(404).json({ message: 'User not found' });
        // College isolation
        if (user.collegeId._id.toString() !== req.user.collegeId.toString()) {
            return res.status(403).json({ message: 'Forbidden. Cross-college access.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        user.branch = req.body.branch || user.branch;
        user.skills = req.body.skills || user.skills;
        user.experience = req.body.experience || user.experience;
        user.education = req.body.education || user.education;

        if (req.files?.profilePhoto) {
            user.profilePhoto = req.files.profilePhoto[0].path;
        }
        if (req.files?.resumePDF) {
            user.resumePDF = req.files.resumePDF[0].path;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/college  — users from same college
const getCollegeUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const filter = { collegeId: req.user.collegeId };
        if (role) filter.role = role;
        if (search) filter.name = { $regex: search, $options: 'i' };
        const users = await User.find(filter).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/:id/follow
const followUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) return res.status(400).json({ message: "You cannot follow yourself" });
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: "User not found" });

        // Add to followRequests if not already a follower or requested
        if (targetUser.followers.includes(req.user._id)) return res.status(400).json({ message: "Already following" });
        if (targetUser.followRequests.includes(req.user._id)) return res.status(400).json({ message: "Follow request already sent" });

        targetUser.followRequests.push(req.user._id);
        await targetUser.save();

        // Notification
        const Notification = require('../models/Notification');
        await Notification.create({
            userId: targetUser._id,
            type: 'FOLLOW_REQUEST',
            content: `${req.user.name} sent you a connection request.`,
            link: `/profile/${req.user._id}`
        });

        res.json({ message: "Follow request sent" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/:id/accept-follow
const acceptFollow = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const senderId = req.params.id;

        if (!currentUser.followRequests.includes(senderId)) {
            return res.status(400).json({ message: "No such follow request" });
        }

        currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== senderId);
        currentUser.followers.push(senderId);
        await currentUser.save();

        const senderUser = await User.findById(senderId);
        if (senderUser) {
            senderUser.following.push(currentUser._id);
            await senderUser.save();

            const Notification = require('../models/Notification');
            await Notification.create({
                userId: senderId,
                type: 'FOLLOW_ACCEPTED',
                content: `${currentUser.name} accepted your connection request.`,
                link: `/profile/${currentUser._id}`
            });
        }

        res.json({ message: "Follow request accepted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/:id/reject-follow
const rejectFollow = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const senderId = req.params.id;
        currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== senderId);
        await currentUser.save();
        res.json({ message: "Follow request rejected" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, getUserById, updateProfile, getCollegeUsers, followUser, acceptFollow, rejectFollow };
