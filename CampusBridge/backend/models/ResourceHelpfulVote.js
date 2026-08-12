const mongoose = require('mongoose');

const resourceHelpfulVoteSchema = new mongoose.Schema({
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Prevent duplicate helpful votes
resourceHelpfulVoteSchema.index({ resourceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ResourceHelpfulVote', resourceHelpfulVoteSchema);
