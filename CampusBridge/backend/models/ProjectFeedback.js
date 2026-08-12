const mongoose = require('mongoose');

const projectFeedbackSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    technicalDepth: { type: Number, min: 1, max: 5, required: true },
    industryRelevance: { type: Number, min: 1, max: 5, required: true },
    scalability: { type: Number, min: 1, max: 5, required: true },
    clarity: { type: Number, min: 1, max: 5, required: true },
    
    feedback: { type: String, required: true },
    suggestions: { type: String },
    
    isPublic: { type: Boolean, default: true } // Whether other students can see it
}, { timestamps: true });

projectFeedbackSchema.index({ projectId: 1, alumniId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectFeedback', projectFeedbackSchema);
