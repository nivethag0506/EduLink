const MentoringRequest = require('../models/MentoringRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// POST /api/mentoring
const requestSession = async (req, res) => {
    try {
        const { mentorId, topic, message } = req.body;

        // Verify mentor exists and is Senior or Alumni
        const mentor = await User.findById(mentorId);
        if (!mentor || !['Senior', 'Alumni'].includes(mentor.role)) {
            return res.status(400).json({ message: 'Invalid mentor. Must be Senior or Alumni.' });
        }

        // Verify that requester is a follower of the mentor
        if (!mentor.followers.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must follow this mentor first to request a session.' });
        }

        const request = await MentoringRequest.create({
            studentId: req.user._id,
            mentorId,
            topic,
            message
        });

        // Notify mentor
        await Notification.create({
            userId: mentorId,
            type: 'MENTORING_REQUEST',
            content: `${req.user.name} requested a mentoring session on: ${topic}`,
            link: `/notifications` // we can show it in notifications or a specific tab
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/mentoring
// Gets all requests where user is either student or mentor
const getMyRequests = async (req, res) => {
    try {
        const requests = await MentoringRequest.find({
            $or: [{ studentId: req.user._id }, { mentorId: req.user._id }]
        })
            .populate('studentId', 'name profilePhoto role')
            .populate('mentorId', 'name profilePhoto role')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/mentoring/:id/accept
const acceptRequest = async (req, res) => {
    try {
        const { scheduledDate, scheduledTime } = req.body;
        if (!scheduledDate || !scheduledTime) return res.status(400).json({ message: 'Date and time are required' });

        const request = await MentoringRequest.findById(req.params.id).populate('studentId').populate('mentorId');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.mentorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Generate Jitsi link
        const roomName = `CampusBridge-Mentoring-${crypto.randomBytes(8).toString('hex')}`;
        const meetLink = `https://meet.jit.si/${roomName}`;

        request.status = 'accepted';
        request.scheduledDate = scheduledDate;
        request.scheduledTime = scheduledTime;
        request.meetLink = meetLink;
        await request.save();

        // Notify student
        await Notification.create({
            userId: request.studentId._id,
            type: 'MENTORING_ACCEPTED',
            content: `${request.mentorId.name} accepted your mentoring request! Scheduled: ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
            link: `/call/${roomName}`
        });

        // Also notify mentor so they have the call link too
        await Notification.create({
            userId: request.mentorId._id,
            type: 'MENTORING_ACCEPTED',
            content: `You accepted ${request.studentId.name}'s mentoring request. Session: ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
            link: `/call/${roomName}`
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/mentoring/:id/reject
const rejectRequest = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ message: 'Reason is required' });

        const request = await MentoringRequest.findById(req.params.id).populate('studentId').populate('mentorId');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.mentorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        request.status = 'rejected';
        request.rejectionReason = reason;
        await request.save();

        // Notify student
        await Notification.create({
            userId: request.studentId._id,
            type: 'MENTORING_REJECTED',
            content: `${request.mentorId.name} declined your mentoring request. Reason: ${reason}`,
            link: `/notifications`
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/mentoring/:id/complete
const completeRequest = async (req, res) => {
    try {
        const request = await MentoringRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        request.status = 'completed';
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { requestSession, getMyRequests, acceptRequest, rejectRequest, completeRequest };
