const mongoose = require('mongoose');

const projectLikeSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

projectLikeSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectLike', projectLikeSchema);
