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
            message: `Your verification OTP is: ${otp}. It will expire in 5 minutes.`
        });

        if (!emailSent) return res.status(500).json({ message: 'Failed to send OTP email. Please modify .env with email credentials.' });

        res.status(200).json({ message: 'OTP sent successfully' });
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
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
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
            message: `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`
        });

        if (!emailSent) return res.status(500).json({ message: 'Failed to send OTP email.' });

        res.status(200).json({ message: 'Password reset OTP sent to email' });
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
