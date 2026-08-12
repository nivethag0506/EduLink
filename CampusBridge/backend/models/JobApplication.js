const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumePath: { type: String, required: true },
    matchScore: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Applied', 'Shortlisted', 'Referred', 'Rejected', 'Declined'], 
        default: 'Applied' 
    }
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
