const express = require('express');
const router = express.Router();
const { createSession, getSessions, registerForSession, deleteSession, unregisterForSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getSessions);
router.put('/:id/register', protect, registerForSession);
router.delete('/:id', protect, deleteSession);
router.delete('/:id/register', protect, unregisterForSession);

module.exports = router;
