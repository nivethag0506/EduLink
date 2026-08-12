const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, required: true },
    problemStatement: { type: String },
    proposedSolution: { type: String },
    
    projectType: { 
        type: String, 
        enum: ['Academic Project', 'Mini Project', 'Final Year Project', 'Personal Project', 'Hackathon Project', 'Research Project', 'Open Source Project'],
        required: true
    },
    domain: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Idea', 'In Development', 'Completed', 'Published', 'Archived'],
        default: 'In Development'
    },
    
    technologies: [{ type: String }],
    skills: [{ type: String }],
    features: [{ type: String }],
    
    githubUrl: { type: String },
    liveDemoUrl: { type: String },
    documentationUrl: { type: String },
    datasetUrl: { type: String },
    demoVideoUrl: { type: String }, // can be a file path or an external URL
    
    screenshots: [{ type: String }], // Array of file paths
    architectureImage: { type: String },
    
    architectureDetails: {
        frontend: { type: String },
        backend: { type: String },
        database: { type: String },
        aiMl: { type: String },
        externalApis: { type: String },
        cloudDeployment: { type: String },
        otherServices: { type: String }
    },
    
    challenges: { type: String },
    futureImprovements: { type: String },
    
    teamMembers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        contribution: { type: String }
    }],
    
    facultyMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    collaborationSettings: {
        lookingForCollaborators: { type: Boolean, default: false },
        requirements: [{
            requiredSkill: { type: String },
            requiredRole: { type: String },
            numberOfCollaborators: { type: Number },
            description: { type: String }
        }]
    },
    
    visibility: { 
        type: String, 
        enum: ['Public', 'College Only', 'Private'], 
        default: 'Public' 
    },
    
    verificationStatus: { 
        type: String, 
        enum: ['Not Verified', 'Faculty Verified', 'Admin Verified'],
        default: 'Not Verified'
    },
    
    likeCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 }
    
}, { timestamps: true });

// Indexes for fast querying
projectSchema.index({ collegeId: 1, status: 1, visibility: 1 });
projectSchema.index({ collegeId: 1, projectType: 1 });
projectSchema.index({ collegeId: 1, domain: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ slug: 1 });

module.exports = mongoose.model('Project', projectSchema);
