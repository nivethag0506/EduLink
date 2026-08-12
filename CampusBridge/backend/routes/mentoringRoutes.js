const express = require('express');
const router = express.Router();
const { requestSession, getMyRequests, acceptRequest, rejectRequest, completeRequest } = require('../controllers/mentoringController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, requestSession);
router.get('/', protect, getMyRequests);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/:id/complete', protect, completeRequest);

module.exports = router;
