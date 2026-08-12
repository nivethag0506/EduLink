const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const careerController = require('../controllers/careerController');

router.get('/roles', protect, careerController.getTargetRoles);
router.post('/target', protect, careerController.setTargetRole);
router.post('/analyze', protect, careerController.analyzeProfile);
router.get('/dashboard', protect, careerController.getDashboard);
router.put('/roadmap/progress', protect, careerController.updateRoadmapProgress);
router.get('/recommendations/:type', protect, careerController.getRecommendations);

module.exports = router;
