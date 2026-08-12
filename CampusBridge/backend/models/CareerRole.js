const mongoose = require('mongoose');

const careerRoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    domain: { type: String, required: true },
    
    requiredSkills: [{
        skillName: { type: String, required: true },
        expectedLevel: { type: Number, min: 1, max: 4, required: true }, // 1: Beginner, 2: Intermediate, 3: Advanced, 4: Expert
        importance: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
        category: { type: String }
    }],
    
    preferredSkills: [{
        skillName: { type: String, required: true },
        expectedLevel: { type: Number, min: 1, max: 4, required: true },
        importance: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
        category: { type: String }
    }],
    
    experienceLevel: { type: String, enum: ['Entry', 'Junior', 'Mid', 'Senior'], default: 'Entry' },
    recommendedProjectTypes: [{ type: String }],
    interviewTopics: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('CareerRole', careerRoleSchema);
