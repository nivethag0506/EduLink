const mongoose = require('mongoose');

const projectCollaborationRequestSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedRole: { type: String, required: true },
    message: { type: String },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected'], 
        default: 'Pending' 
    }
}, { timestamps: true });

// A user can only have one active request per project role
projectCollaborationRequestSchema.index({ projectId: 1, requesterId: 1, requestedRole: 1 }, { unique: true });

module.exports = mongoose.model('ProjectCollaborationRequest', projectCollaborationRequestSchema);
