const mongoose = require('mongoose');

const interviewExperienceBookmarkSchema = new mongoose.Schema({
    experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewExperience', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Prevent duplicate bookmarks
interviewExperienceBookmarkSchema.index({ experienceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('InterviewExperienceBookmark', interviewExperienceBookmarkSchema);
