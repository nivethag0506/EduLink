const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Senior', 'Alumni', 'Admin'], required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    branch: { type: String },
    year: { type: Number },
    graduationYear: { type: Number },
    idCardImage: { type: String, required: function () { return this.role !== 'Admin'; } },
    profilePhoto: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    experience: [{
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String
    }],
    education: [{
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        current: Boolean
    }],
    resumePDF: { type: String },
    isVerified: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
