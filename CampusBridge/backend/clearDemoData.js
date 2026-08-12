const mongoose = require('mongoose');
require('dotenv').config();

const College = require('./models/College');
const User = require('./models/User');
const Post = require('./models/Post');
const Session = require('./models/Session');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusbridge');
        console.log('Connected to MongoDB');

        // Find the master admin so we do not completely lock you out of the platform
        const admin = await User.findOne({ email: 'admin@campusbridge.com' });

        if (admin) {
            // Delete all users except the admin
            await User.deleteMany({ _id: { $ne: admin._id } });
            // Delete all colleges except the one the admin is tied to (so the admin can still log in)
            await College.deleteMany({ _id: { $ne: admin.collegeId } });
        } else {
            // If no admin exists, totally wipe everything
            await User.deleteMany({});
            await College.deleteMany({});
        }

        // Wipe all user-generated content
        await Post.deleteMany({});
        await Session.deleteMany({});
        await Message.deleteMany({});
        await Notification.deleteMany({});

        console.log('✅ Demo data successfully cleared!');
        if (admin) {
            console.log('🛡️  Platform Admin (admin@campusbridge.com) was kept so you can still log in and add new colleges/verify users.');
        } else {
            console.log('⚠️ Database is completely empty. You will need to manually insert an admin user via MongoDB Atlas to use the app.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
