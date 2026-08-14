const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    description: { type: String, required: true },
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    meetLink: { type: String, required: true },
    registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    cancellationRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
