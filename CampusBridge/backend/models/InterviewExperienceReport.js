const mongoose = require('mongoose');

const interviewExperienceReportSchema = new mongoose.Schema({
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewExperience', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { 
        type: String, 
        enum: ['Spam', 'Fake information', 'Offensive content', 'Personal information', 'Confidential information', 'Other'],
        required: true
    },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Dismissed'], default: 'Pending' }
}, { timestamps: true });

// Prevent duplicate reports from same user for same experience
interviewExperienceReportSchema.index({ experienceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('InterviewExperienceReport', interviewExperienceReportSchema);
