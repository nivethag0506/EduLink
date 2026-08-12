const mongoose = require('mongoose');

const interviewExperienceVoteSchema = new mongoose.Schema({
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewExperience', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Prevent duplicate votes
interviewExperienceVoteSchema.index({ experienceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('InterviewExperienceVote', interviewExperienceVoteSchema);
