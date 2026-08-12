const mongoose = require('mongoose');

const projectReportSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Reviewed', 'Dismissed'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('ProjectReport', projectReportSchema);
