const mongoose = require('mongoose');

const studentSkillProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    targetRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole' },
    
    skills: [{
        skillName: { type: String, required: true },
        currentLevel: { type: Number, min: 1, max: 4, required: true },
        source: { type: String, enum: ['Profile', 'Project', 'AI Assessment', 'Resume', 'Self Assessment'], required: true },
        confidence: { type: String, enum: ['Low', 'Medium', 'High'], required: true }
    }],
    
    readinessScore: { type: Number, default: 0 },
    
    scoreBreakdown: {
        technicalSkills: { type: Number, default: 0 },
        projects: { type: Number, default: 0 },
        experience: { type: Number, default: 0 }
    },
    
    topSkillGaps: [{
        skillName: { type: String },
        currentLevel: { type: Number },
        requiredLevel: { type: Number },
        priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
        reason: { type: String }
    }],
    
    lastAnalyzedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('StudentSkillProfile', studentSkillProfileSchema);
