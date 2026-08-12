const mongoose = require('mongoose');

const mentoringRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
    rejectionReason: { type: String },
    scheduledDate: { type: Date },
    scheduledTime: { type: String },
    meetLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MentoringRequest', mentoringRequestSchema);
