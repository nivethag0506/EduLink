const mongoose = require('mongoose');

const projectAIAnalysisSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
    
    technicalComplexity: { type: String },
    skillsDemonstrated: [{ type: String }],
    strengths: [{ type: String }],
    potentialWeaknesses: [{ type: String }],
    recommendedImprovements: [{ type: String }],
    
    scalabilityImprovements: { type: String },
    securityImprovements: { type: String },
    deploymentImprovements: { type: String },
    
    suggestedResumeDescription: { type: String },
    
    potentialInterviewQuestions: [{
        question: { type: String },
        context: { type: String }
    }],
    
    lastAnalyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProjectAIAnalysis', projectAIAnalysisSchema);
