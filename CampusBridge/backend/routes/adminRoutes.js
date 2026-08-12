const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
    getStats, getUsers, verifyUser, rejectUser, banUser, deleteUser,
    addCollege, getColleges, deleteCollege, getActivity, adminDeletePost
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id/ban', banUser);
router.delete('/users/:id', deleteUser);
router.post('/colleges', upload.single('logo'), addCollege);
router.get('/colleges', getColleges);
router.delete('/colleges/:id', deleteCollege);
router.get('/activity', getActivity);
router.delete('/posts/:id', adminDeletePost);

module.exports = router;
