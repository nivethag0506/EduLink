const mongoose = require('mongoose');

const careerRoadmapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    targetRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', required: true },
    
    milestones: [{
        phase: { type: Number, required: true },
        phaseName: { type: String, required: true }, // e.g., "JavaScript Fundamentals"
        skillName: { type: String, required: true },
        learningObjective: { type: String, required: true },
        whyItMatters: { type: String, required: true },
        whatToBuild: { type: String },
        status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'Skipped'], default: 'Not Started' },
        estimatedEffort: { type: String },
        completionDate: { type: Date }
    }],
    
    completionPercentage: { type: Number, default: 0 },
    
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CareerRoadmap', careerRoadmapSchema);
