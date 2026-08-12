const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['MESSAGE', 'SESSION_APPROVED', 'POST_LIKED', 'COMMENT_ADDED', 'INTERNSHIP_POSTED', 'FOLLOW_REQUEST', 'FOLLOW_ACCEPTED', 'MENTORING_REQUEST', 'MENTORING_ACCEPTED', 'MENTORING_REJECTED', 'SYSTEM', 'PROJECT_COLLAB_REQUEST', 'PROJECT_COLLAB_ACCEPTED', 'PROJECT_FEEDBACK', 'PROJECT_VERIFIED', 'PROJECT_APPROVED', 'PROJECT_REJECTED'], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
