const mongoose = require('mongoose');

const projectBookmarkSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

projectBookmarkSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectBookmark', projectBookmarkSchema);
