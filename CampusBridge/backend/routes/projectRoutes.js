const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const projectController = require('../controllers/projectController');

// Define upload fields for project media
const projectMediaUpload = upload.fields([
    { name: 'screenshots', maxCount: 5 },
    { name: 'demoVideo', maxCount: 1 },
    { name: 'architectureImage', maxCount: 1 }
]);

router.post('/', protect, projectMediaUpload, projectController.createProject);
router.get('/', protect, projectController.getProjects);
router.get('/bookmarks', protect, projectController.getBookmarkedProjects);
router.get('/:slug', protect, projectController.getProjectBySlug);
router.put('/:id', protect, projectMediaUpload, projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);

// Engagements
router.post('/:id/like', protect, projectController.toggleLike);
router.post('/:id/bookmark', protect, projectController.toggleBookmark);
router.post('/:id/report', protect, projectController.reportProject);

// Collaboration & Feedback
router.post('/:id/collaborate', protect, projectController.submitCollaborationRequest);
router.post('/:id/feedback', protect, projectController.submitFeedback);
router.post('/:id/verify', protect, projectController.verifyProject);

// AI
router.get('/:id/analyze', protect, projectController.getAIAnalysis);

module.exports = router;
