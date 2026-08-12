const mongoose = require('mongoose');

const interviewInsightSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    
    // AI generated content
    mostCommonTopics: [{ type: String }],
    commonInterviewRounds: [{ type: String }],
    frequentlyMentionedSkills: [{ type: String }],
    difficultyDistribution: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    },
    commonPreparationResources: [{ type: String }],
    generalRecommendations: { type: String },
    
    // Metadata
    basedOnExperienceCount: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// We want one insight per college, company, and role combination
interviewInsightSchema.index({ collegeId: 1, companyName: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('InterviewInsight', interviewInsightSchema);
