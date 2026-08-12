const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], required: true },
    workMode: { type: String, enum: ['Onsite', 'Remote', 'Hybrid'], required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String, required: true }],
    experienceRequired: { type: Number, default: 0 },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
