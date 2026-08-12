const mongoose = require('mongoose');

const resourceReportSchema = new mongoose.Schema({
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { 
        type: String, 
        enum: ['Spam', 'Incorrect information', 'Copyright issue', 'Inappropriate content', 'Suspicious file', 'Other'],
        required: true
    },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Dismissed'], default: 'Pending' }
}, { timestamps: true });

// Prevent duplicate reports from same user for same resource
resourceReportSchema.index({ resourceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ResourceReport', resourceReportSchema);
