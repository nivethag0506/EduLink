const Session = require('../models/Session');
const Notification = require('../models/Notification');

// POST /api/sessions  (Alumni only)
const createSession = async (req, res) => {
    try {
        if (req.user.role !== 'Alumni' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only alumni can create sessions' });
        }
        const { topic, description, meetLink, date, duration } = req.body;
        const session = await Session.create({
            topic, description, meetLink, date, duration,
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

// DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.alumniId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await session.deleteOne();
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/sessions/:id/cancel-request
const requestCancellation = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        
        if (!session.cancellationRequests.includes(req.user._id)) {
            session.cancellationRequests.push(req.user._id);
            await session.save();

            // Notify the alumni
            await Notification.create({
                userId: session.alumniId,
                type: 'SESSION_CANCEL_REQUEST',
                content: `${req.user.name} requested to cancel their registration for: ${session.topic}`,
                link: `/sessions`
            });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/sessions/:id/approve-cancel
const approveCancellation = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.alumniId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { studentId } = req.body;
        
        session.registeredStudents = session.registeredStudents.filter(id => id.toString() !== studentId);
        session.cancellationRequests = session.cancellationRequests.filter(id => id.toString() !== studentId);
        await session.save();

        // Notify the student
        await Notification.create({
            userId: studentId,
            type: 'SESSION_CANCEL_APPROVED',
            content: `Your cancellation request for '${session.topic}' was approved.`,
            link: `/sessions`
        });

        const populated = await session.populate('alumniId', 'name profilePhoto role');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSession, getSessions, registerForSession, deleteSession, requestCancellation, approveCancellation };
