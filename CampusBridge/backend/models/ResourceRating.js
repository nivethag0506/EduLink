const mongoose = require('mongoose');

const resourceRatingSchema = new mongoose.Schema({
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

// Prevent duplicate ratings from the same user for the same resource
resourceRatingSchema.index({ resourceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ResourceRating', resourceRatingSchema);
