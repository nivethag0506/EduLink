const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendVerificationOtp, forgotPassword, resetPassword } = require('../controllers/authController');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/send-otp', sendVerificationOtp);
router.post('/register', upload.fields([{ name: 'idCardImage', maxCount: 1 }]), registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
