const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    resourceType: { 
        type: String, 
        enum: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'Image', 'External Link', 'YouTube Link', 'GitHub Repository'],
        required: true 
    },
    category: { 
        type: String, 
        enum: ['Placement', 'Academics', 'Programming', 'Projects', 'Career'],
        required: true,
        index: true
    },
    subcategory: { type: String },
    tags: [{ type: String, index: true }],
    skills: [{ type: String, index: true }],
    department: { type: String, index: true },
    academicYear: { type: String },
    company: { type: String },
    
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    
    fileUrl: { type: String },
    externalUrl: { type: String },
    fileSize: { type: Number },
    
    status: { 
        type: String, 
        enum: ['Draft', 'Pending Review', 'Published', 'Rejected', 'Archived'], 
        default: 'Published',
        index: true
    },
    verificationBadge: { 
        type: String, 
        enum: ['None', 'Faculty Verified', 'Alumni Verified', 'Admin Verified'], 
        default: 'None' 
    },
    
    downloadCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

// Compound indexes for common queries
resourceSchema.index({ collegeId: 1, status: 1, createdAt: -1 });
resourceSchema.index({ collegeId: 1, category: 1, status: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
