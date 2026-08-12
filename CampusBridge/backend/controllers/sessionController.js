const Session = require('../models/Session');
const Notification = require('../models/Notification');

// POST /api/sessions  (Alumni only)
const createSession = async (req, res) => {
    try {
        if (req.user.role !== 'Alumni' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only alumni can create sessions' });
        }
        const { topic, description, meetLink, date } = req.body;
        const session = await Session.create({
            topic, description, meetLink, date,
            alumniId: req.user._id,
            collegeId: req.user.collegeId
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/sessions  — college scoped
const getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ collegeId: req.user.collegeId })
            .sort({ date: 1 })
            .populate('alumniId', 'name profilePhoto role');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/sessions/:id/register
const registerForSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.collegeId.toString() !== req.user.collegeId.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (session.registeredStudents.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already registered' });
        }
        session.registeredStudents.push(req.user._id);
        await session.save();
        // Notify the alumni
        await Notification.create({
            userId: session.alumniId,
            type: 'SESSION_APPROVED',
            content: `${req.user.name} registered for your session: ${session.topic}`,
            link: `/sessions`
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSession, getSessions, registerForSession };
