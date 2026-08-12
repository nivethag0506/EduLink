const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');
const College = require('./models/College');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusbridge');
        console.log('Connected to DB');

        // Create a default college
        let college = await College.findOne({ domain: 'admin.edu' });
        if (!college) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            college = await College.create({
                name: 'System Admin College',
                code,
                domain: 'admin.edu'
            });
            console.log('Default College created');
        }

        // Create a default Admin user
        const adminExists = await User.findOne({ email: 'admin@campusbridge.com' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await User.create({
                name: 'Platform Admin',
                email: 'admin@campusbridge.com',
                password: hashedPassword,
                role: 'Admin',
                collegeId: college._id,
                isVerified: true
            });
            console.log('Default Admin user created (admin@campusbridge.com / admin123)');
        }

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
