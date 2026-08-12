const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getExperiences,
    getExperienceById,
    createExperience,
    updateExperience,
    deleteExperience,
    voteHelpful,
    removeVoteHelpful,
    bookmarkExperience,
    removeBookmark,
    getBookmarks,
    reportExperience,
    getAiInsights
} = require('../controllers/interviewExperienceController');

// AI Insights route must come before /:id so 'insights' isn't treated as an ID
router.get('/insights', protect, getAiInsights);

// Bookmarks routes must come before /:id as well
router.get('/bookmarks', protect, getBookmarks);

// Standard CRUD
router.get('/', protect, getExperiences);
router.post('/', protect, createExperience);
router.get('/:id', protect, getExperienceById);
router.put('/:id', protect, updateExperience);
router.delete('/:id', protect, deleteExperience);

// Engagement
router.post('/:id/vote', protect, voteHelpful);
router.delete('/:id/vote', protect, removeVoteHelpful);
router.post('/:id/bookmark', protect, bookmarkExperience);
router.delete('/:id/bookmark', protect, removeBookmark);
router.post('/:id/report', protect, reportExperience);

module.exports = router;
