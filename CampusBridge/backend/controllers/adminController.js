const User = require('../models/User');
const Post = require('../models/Post');
const College = require('../models/College');
const Session = require('../models/Session');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'Student' });
        const totalAlumni = await User.countDocuments({ role: 'Alumni' });
        const totalColleges = await College.countDocuments();
        const totalPosts = await Post.countDocuments();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        const activeUsers = await User.countDocuments({ updatedAt: { $gte: sevenDaysAgo } });

        // Chart 1: Monthly Registrations
        const monthlyData = await User.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);
        const monthlyRegistrations = monthlyData.map(d => ({ month: d._id, users: d.count }));

        // Chart 2: Department-wise Count
        const deptData = await User.aggregate([
            { $match: { branch: { $ne: null, $ne: "" } } },
            { $group: { _id: "$branch", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const departmentStats = deptData.map(d => ({ branch: d._id, count: d.count }));

        // Chart 3: College-wise Count & Role Split
        const collegeData = await User.aggregate([
            { $lookup: { from: "colleges", localField: "collegeId", foreignField: "_id", as: "college" } },
            { $unwind: { path: "$college", preserveNullAndEmptyArrays: false } }, // only users with colleges
            { $group: { _id: { collegeName: "$college.name", role: "$role" }, count: { $sum: 1 } } }
        ]);

        const collegeStatsMap = {};
        collegeData.forEach(item => {
            const college = item._id.collegeName;
            const role = item._id.role;
            if (!collegeStatsMap[college]) {
                collegeStatsMap[college] = { name: college, Student: 0, Alumni: 0, Senior: 0, Total: 0 };
            }
            if (role === 'Student' || role === 'Alumni' || role === 'Senior') {
                collegeStatsMap[college][role] = item.count;
            }
            collegeStatsMap[college].Total += item.count;
        });
        const collegeStats = Object.values(collegeStatsMap).sort((a, b) => b.Total - a.Total);

        res.json({
            totalUsers, totalStudents, totalAlumni, totalColleges, totalPosts, activeUsers,
            monthlyRegistrations, departmentStats, collegeStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const { search, college, role, verified } = req.query;
        const filter = {};
        if (search) filter.name = { $regex: search, $options: 'i' };
        if (college) filter.collegeId = college;
        if (role) filter.role = role;
        if (verified !== undefined && verified !== '') filter.isVerified = verified === 'true';
        const users = await User.find(filter).select('-password').populate('collegeId', 'name code');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users/:id/verify
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isVerified = true;
        await user.save();

        // Send approval email
        await sendEmail({
            email: user.email,
            subject: 'CampusBridge - Account Approved',
            message: `Hello ${user.name},\n\nYour account has been approved by the admin. You can now login to CampusBridge.\n\nWelcome!`
        });

        res.json({ message: 'User verified', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users/:id/reject
const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.findByIdAndDelete(req.params.id);
            // Send rejection email
            await sendEmail({
                email: user.email,
                subject: 'CampusBridge - Account Rejected',
                message: `Hello ${user.name},\n\nWe regret to inform you that your account registration has been rejected by the admin. If you believe this is a mistake, please contact support.`
            });
        }
        res.json({ message: 'User rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users/:id/ban
const banUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isVerified = false;
        await user.save();
        res.json({ message: 'User banned' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/colleges
const addCollege = async (req, res) => {
    try {
        const { name, domain } = req.body;
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        let logo = '';
        if (req.file) logo = req.file.path;
        const college = await College.create({ name, code, domain, logo });
        res.status(201).json(college);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/colleges
const getColleges = async (req, res) => {
    try {
        const colleges = await College.find();
        // Attach user count per college
        const result = await Promise.all(colleges.map(async (c) => {
            const userCount = await User.countDocuments({ collegeId: c._id });
            return { ...c.toObject(), userCount };
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/colleges/:id
const deleteCollege = async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) return res.status(404).json({ message: 'College not found' });
        
        // Optional: you can check if there are users attached to this college and prevent deletion, 
        // but since you requested core functionality unchanged, we just delete it.
        await College.findByIdAndDelete(req.params.id);
        res.json({ message: 'College removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/activity
const getActivity = async (req, res) => {
    try {
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt');
        const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(10).populate('authorId', 'name');
        const recentSessions = await Session.find().sort({ createdAt: -1 }).limit(10).populate('alumniId', 'name');
        res.json({ recentUsers, recentPosts, recentSessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/posts/:id
const adminDeletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStats, getUsers, verifyUser, rejectUser, banUser, deleteUser, addCollege, getColleges, deleteCollege, getActivity, adminDeletePost };
