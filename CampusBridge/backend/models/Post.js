const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    type: { type: String, enum: ['Doubt', 'Project', 'Internship', 'Event', 'Announcement'], required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    fileAttachment: { type: String }, // For PDFs
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
