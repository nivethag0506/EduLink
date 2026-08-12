const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
    roundNumber: { type: Number, required: true },
    roundType: { type: String, required: true }, // e.g., 'Online Assessment', 'Technical Interview'
    duration: { type: String }, // e.g., '45 mins'
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    topics: [{ type: String }],
    questions: [{ type: String }],
    description: { type: String },
    tips: { type: String }
});

const interviewExperienceSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    companyName: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    department: { type: String, index: true },
    graduationYear: { type: Number },
    interviewYear: { type: Number, required: true, index: true },
    interviewType: { 
        type: String, 
        enum: ['Campus Placement', 'Off Campus', 'Internship', 'Referral', 'Hackathon / Competition'],
        required: true
    },
    result: { 
        type: String, 
        enum: ['Selected', 'Rejected', 'Waitlisted', 'Offer Received', 'Not Disclosed'],
        required: true
    },
    overallDifficulty: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
        index: true
    },
    preparationDuration: { type: String },
    preparationResources: [{ type: String }],
    overallExperience: { type: String, required: true },
    adviceForStudents: { type: String },
    isAnonymous: { type: Boolean, default: false },
    rounds: [roundSchema],
    
    // Aggregates for sorting/filtering
    helpfulCount: { type: Number, default: 0, index: true },
    bookmarkCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Published', 'Flagged', 'Removed'], default: 'Published' }
}, { timestamps: true });

// Compound indexes to speed up common queries
interviewExperienceSchema.index({ collegeId: 1, companyName: 1 });
interviewExperienceSchema.index({ collegeId: 1, role: 1 });
interviewExperienceSchema.index({ collegeId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
