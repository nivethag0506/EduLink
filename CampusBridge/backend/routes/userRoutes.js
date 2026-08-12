const express = require('express');
const router = express.Router();
const { getProfile, getUserById, updateProfile, getCollegeUsers, followUser, acceptFollow, rejectFollow } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'resumePDF', maxCount: 1 }
]), updateProfile);
router.get('/college', protect, getCollegeUsers);
router.post('/:id/follow', protect, followUser);
router.post('/:id/accept-follow', protect, acceptFollow);
router.post('/:id/reject-follow', protect, rejectFollow);
router.get('/:id', protect, getUserById);

module.exports = router;
