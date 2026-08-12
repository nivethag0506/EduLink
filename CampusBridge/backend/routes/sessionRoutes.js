const express = require('express');
const router = express.Router();
const { createSession, getSessions, registerForSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getSessions);
router.put('/:id/register', protect, registerForSession);

module.exports = router;
