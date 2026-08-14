const express = require('express');
const router = express.Router();
const { createSession, getSessions, registerForSession, deleteSession, requestCancellation, approveCancellation } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getSessions);
router.put('/:id/register', protect, registerForSession);
router.delete('/:id', protect, deleteSession);
router.post('/:id/cancel-request', protect, requestCancellation);
router.put('/:id/approve-cancel', protect, approveCancellation);

module.exports = router;
