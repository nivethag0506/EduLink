const User = require('../models/User');
const College = require('../models/College');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const otp = generateOtp();
        // Clear previous OTPs for this email to avoid duplicates
        await Otp.deleteMany({ email });
        await Otp.create({ email, otp });

        const emailSent = await sendEmail({
            email,
            subject: 'CampusBridge - Account Verification OTP',
            message: `Your verification OTP is: ${otp}. It will expire in 5 minutes.`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Hi there,</p>
                <p>Someone (probably you) has requested to create an account on <strong>CampusBridge</strong>.</p>
                <p>To confirm this and verify your email address, please use the following OTP:</p>
                <h2 style="color: #6366F1; letter-spacing: 4px; padding: 10px; background: #F3F4F6; display: inline-block; border-radius: 8px;">${otp}</h2>
                <p>If you did not request this, you can safely ignore this email.</p>
                <br>
                <p>If you need help, please contact the site administrator.</p>
                <p><strong>CampusBridge Team</strong></p>
            </div>
            `
        });

        if (!emailSent) return res.status(500).json({ message: 'Failed to send OTP email. Please modify .env with email credentials.' });

        const isMock = process.env.MOCK_EMAIL === 'true' || !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
        const successMessage = isMock 
            ? `OTP sent successfully! (MOCK MODE OTP: ${otp})` 
            : 'OTP sent successfully';

        res.status(200).json({ message: successMessage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, collegeId, branch, year, graduationYear, otp } = req.body;

        if (!otp) return res.status(400).json({ message: 'OTP is required' });

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Validate college
        const college = await College.findById(collegeId);
        if (!college) return res.status(404).json({ message: 'College not found' });

        // Require ID image unless Admin
        let idCardImage = '';
        if (role !== 'Admin') {
            if (!req.file && !req.files?.idCardImage) {
                return res.status(400).json({ message: 'ID card image is required for users' });
            }
            idCardImage = req.files?.idCardImage ? req.files.idCardImage[0].path : req.file?.path;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, role, collegeId, branch, year, graduationYear,
            idCardImage,
            isVerified: false // Admin verification required
        });

        await Otp.deleteMany({ email }); // Clear OTPs once registered

        res.status(201).json({
            message: 'Registration successful. Please wait for admin verification.'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('collegeId');

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified && user.role !== 'Admin') {
                return res.status(403).json({ message: 'Account pending admin verification.' });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let newStreak = user.loginStreak || 0;
            if (user.lastLoginDate) {
                const lastLogin = new Date(user.lastLoginDate);
                lastLogin.setHours(0, 0, 0, 0);
                const diffTime = today - lastLogin;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) {
                    newStreak += 1;
                } else if (diffDays > 1) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }
            
            user.loginStreak = newStreak;
            user.lastLoginDate = new Date();
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                loginStreak: user.loginStreak,
                collegeId: user.collegeId?._id || user.collegeId,
                collegeName: user.collegeId?.name || '',
                collegeLogo: user.collegeId?.logo || '',
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = generateOtp();
        await Otp.deleteMany({ email });
        await Otp.create({ email, otp });

        const emailSent = await sendEmail({
            email,
            subject: 'CampusBridge - Password Reset OTP',
            message: `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Hi there,</p>
                <p>Someone (probably you) has requested a new password for your account on <strong>CampusBridge</strong>.</p>
                <p>To confirm this and reset your password, please use the following OTP:</p>
                <h2 style="color: #6366F1; letter-spacing: 4px; padding: 10px; background: #F3F4F6; display: inline-block; border-radius: 8px;">${otp}</h2>
                <p>If you did not request this, you can safely ignore this email.</p>
                <br>
                <p>If you need help, please contact the site administrator.</p>
                <p><strong>CampusBridge Team</strong></p>
            </div>
            `
        });

        if (!emailSent) return res.status(500).json({ message: 'Failed to send OTP email.' });

        const isMock = process.env.MOCK_EMAIL === 'true' || !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
        const successMessage = isMock 
            ? `Password reset OTP sent! (MOCK MODE OTP: ${otp})` 
            : 'Password reset OTP sent to email';

        res.status(200).json({ message: successMessage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await Otp.deleteMany({ email });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, sendVerificationOtp, forgotPassword, resetPassword };
