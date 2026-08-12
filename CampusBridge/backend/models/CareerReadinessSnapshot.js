const mongoose = require('mongoose');

const careerReadinessSnapshotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', required: true },
    
    readinessScore: { type: Number, required: true },
    
    scoreBreakdown: {
        technicalSkills: { type: Number, default: 0 },
        projects: { type: Number, default: 0 },
        experience: { type: Number, default: 0 }
    },
    
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CareerReadinessSnapshot', careerReadinessSnapshotSchema);
