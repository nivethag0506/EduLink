const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
    getResources,
    getResourceById,
    uploadResource,
    updateResource,
    deleteResource,
    incrementDownload,
    voteHelpful,
    removeVoteHelpful,
    bookmarkResource,
    removeBookmark,
    getBookmarks,
    rateResource,
    reportResource,
    getRecommendedResources
} = require('../controllers/resourceController');

// Recommendations and Bookmarks routes must come before /:id
router.get('/recommendations', protect, getRecommendedResources);
router.get('/bookmarks', protect, getBookmarks);

// Standard CRUD
router.get('/', protect, getResources);
// Use upload middleware for resourceFile
router.post('/', protect, upload.single('resourceFile'), uploadResource);
router.get('/:id', protect, getResourceById);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

// Engagement & Interaction
router.post('/:id/download', protect, incrementDownload); // tracking endpoint
router.post('/:id/vote', protect, voteHelpful);
router.delete('/:id/vote', protect, removeVoteHelpful);
router.post('/:id/bookmark', protect, bookmarkResource);
router.delete('/:id/bookmark', protect, removeBookmark);
router.post('/:id/rate', protect, rateResource);
router.post('/:id/report', protect, reportResource);

module.exports = router;
