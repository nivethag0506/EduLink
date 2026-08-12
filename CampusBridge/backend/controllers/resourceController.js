const Resource = require('../models/Resource');
const ResourceBookmark = require('../models/ResourceBookmark');
const ResourceHelpfulVote = require('../models/ResourceHelpfulVote');
const ResourceRating = require('../models/ResourceRating');
const ResourceReport = require('../models/ResourceReport');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get all resources with filters and pagination
const getResources = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, subcategory, department, academicYear, resourceType, status, sort = 'recent' } = req.query;
        
        // Base filter: always isolate by college. By default, only show Published unless user is Admin.
        const filter = { collegeId: req.user.collegeId };
        
        if (status && req.user.role === 'Admin') {
            filter.status = status;
        } else {
            filter.status = 'Published';
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (department) filter.department = department;
        if (academicYear) filter.academicYear = academicYear;
        if (resourceType) filter.resourceType = resourceType;

        const skip = (Number(page) - 1) * Number(limit);
        
        let sortOption = { createdAt: -1 }; // default: latest
        if (sort === 'downloads') sortOption = { downloadCount: -1, createdAt: -1 };
        if (sort === 'helpful') sortOption = { helpfulCount: -1, createdAt: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1, ratingCount: -1, createdAt: -1 };

        const total = await Resource.countDocuments(filter);
        const resources = await Resource.find(filter)
            .populate('uploadedBy', 'name profilePhoto role')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        res.json({
            resources,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalResources: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single resource by ID
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name profilePhoto role');
            
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        
        if (resource.collegeId.toString() !== req.user.collegeId.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to view this resource' });
        }

        // Fetch related resources (same category/subcategory, excluding self)
        const related = await Resource.find({ 
            collegeId: req.user.collegeId, 
            status: 'Published',
            category: resource.category,
            _id: { $ne: resource._id }
        }).limit(3).sort({ helpfulCount: -1, createdAt: -1 });

        // Check if current user has interacted
        const hasBookmarked = await ResourceBookmark.exists({ resourceId: resource._id, userId: req.user._id });
        const hasVoted = await ResourceHelpfulVote.exists({ resourceId: resource._id, userId: req.user._id });
        const userRatingDoc = await ResourceRating.findOne({ resourceId: resource._id, userId: req.user._id });

        res.json({ 
            ...resource.toObject(), 
            relatedResources: related,
            hasBookmarked: !!hasBookmarked, 
            hasVoted: !!hasVoted,
            userRating: userRatingDoc ? userRatingDoc.rating : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload a new resource
const uploadResource = async (req, res) => {
    try {
        const { title, description, resourceType, category, subcategory, tags, skills, department, academicYear, company, externalUrl } = req.body;
        
        // RBAC status check
        let status = 'Pending Review';
        let verificationBadge = 'None';
        
        if (req.user.role === 'Faculty') {
            status = 'Published';
            verificationBadge = 'Faculty Verified';
        } else if (req.user.role === 'Alumni') {
            status = 'Published';
            verificationBadge = 'Alumni Verified';
        } else if (req.user.role === 'Admin') {
            status = 'Published';
            verificationBadge = 'Admin Verified';
        }

        // Handle file URL
        let fileUrl = '';
        let fileSize = 0;
        if (req.file) {
            fileUrl = req.file.path.replace(/\\/g, '/'); // Normalize path
            fileSize = req.file.size;
        }

        // Clean arrays
        const cleanTags = tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : [];
        const cleanSkills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

        const resource = await Resource.create({
            title,
            description,
            resourceType,
            category,
            subcategory,
            tags: cleanTags,
            skills: cleanSkills,
            department,
            academicYear,
            company,
            fileUrl,
            externalUrl,
            fileSize,
            status,
            verificationBadge,
            uploadedBy: req.user._id,
            collegeId: req.user.collegeId
        });
        
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing resource
const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to update this resource' });
        }

        const updatedResource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedResource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a resource
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this resource' });
        }

        await resource.deleteOne();
        
        // Clean up related engagement
        await ResourceBookmark.deleteMany({ resourceId: resource._id });
        await ResourceHelpfulVote.deleteMany({ resourceId: resource._id });
        await ResourceRating.deleteMany({ resourceId: resource._id });
        await ResourceReport.deleteMany({ resourceId: resource._id });

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Increment download count (called when user clicks download/view)
const incrementDownload = async (req, res) => {
    try {
        const resourceId = req.params.id;
        await Resource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });
        res.json({ message: 'Download tracked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vote helpful
const voteHelpful = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const existingVote = await ResourceHelpfulVote.findOne({ resourceId, userId });
        if (existingVote) return res.status(400).json({ message: 'Already voted helpful' });

        await ResourceHelpfulVote.create({ resourceId, userId });
        await Resource.findByIdAndUpdate(resourceId, { $inc: { helpfulCount: 1 } });

        res.json({ message: 'Vote recorded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove helpful vote
const removeVoteHelpful = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const existingVote = await ResourceHelpfulVote.findOne({ resourceId, userId });
        if (!existingVote) return res.status(400).json({ message: 'Not voted yet' });

        await existingVote.deleteOne();
        await Resource.findByIdAndUpdate(resourceId, { $inc: { helpfulCount: -1 } });

        res.json({ message: 'Vote removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bookmark resource
const bookmarkResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const existingBookmark = await ResourceBookmark.findOne({ resourceId, userId });
        if (existingBookmark) return res.status(400).json({ message: 'Already bookmarked' });

        await ResourceBookmark.create({ resourceId, userId });
        await Resource.findByIdAndUpdate(resourceId, { $inc: { bookmarkCount: 1 } });

        res.json({ message: 'Bookmarked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove bookmark
const removeBookmark = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const existingBookmark = await ResourceBookmark.findOne({ resourceId, userId });
        if (!existingBookmark) return res.status(400).json({ message: 'Not bookmarked' });

        await existingBookmark.deleteOne();
        await Resource.findByIdAndUpdate(resourceId, { $inc: { bookmarkCount: -1 } });

        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get bookmarks
const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await ResourceBookmark.find({ userId: req.user._id })
            .populate({
                path: 'resourceId',
                populate: { path: 'uploadedBy', select: 'name profilePhoto role' }
            });

        const resources = bookmarks.map(b => b.resourceId).filter(exp => exp !== null);

        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rate resource
const rateResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;
        const { rating } = req.body;
        
        if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

        const resource = await Resource.findById(resourceId);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        const existingRating = await ResourceRating.findOne({ resourceId, userId });
        
        if (existingRating) {
            // Update rating logic
            const oldRating = existingRating.rating;
            existingRating.rating = rating;
            await existingRating.save();
            
            // Recalculate average
            const newTotalRating = (resource.averageRating * resource.ratingCount) - oldRating + rating;
            resource.averageRating = newTotalRating / resource.ratingCount;
            await resource.save();
            
        } else {
            // New rating logic
            await ResourceRating.create({ resourceId, userId, rating });
            
            const newTotalRating = (resource.averageRating * resource.ratingCount) + rating;
            resource.ratingCount += 1;
            resource.averageRating = newTotalRating / resource.ratingCount;
            await resource.save();
        }

        res.json({ message: 'Rating saved', averageRating: resource.averageRating, ratingCount: resource.ratingCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Report resource
const reportResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;
        const { reason } = req.body;

        const existingReport = await ResourceReport.findOne({ resourceId, userId });
        if (existingReport) return res.status(400).json({ message: 'You have already reported this resource' });

        await ResourceReport.create({ resourceId, userId, reason });
        
        // Auto-flag logic could go here if reports > threshold

        res.json({ message: 'Report submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get recommended resources (Hybrid Rule-based + AI Keyword matching)
const getRecommendedResources = async (req, res) => {
    try {
        const user = req.user;
        const skills = user.skills || [];
        const department = user.branch || user.department || '';

        // Build a robust database query for relevant resources
        const query = { 
            collegeId: user.collegeId, 
            status: 'Published',
            $or: []
        };
        
        if (skills.length > 0) {
            query.$or.push({ skills: { $in: skills } });
            query.$or.push({ tags: { $in: skills } });
        }
        
        if (department) {
            query.$or.push({ department: { $regex: department, $options: 'i' } });
        }
        
        // Fallback if user has no skills or department mapped well
        if (query.$or.length === 0) {
            delete query.$or;
        }

        const recommended = await Resource.find(query)
            .populate('uploadedBy', 'name profilePhoto role')
            .sort({ helpfulCount: -1, averageRating: -1 })
            .limit(5);

        res.json(recommended);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getResources,
    getResourceById,
    uploadResource,
    updateResource,
    deleteResource,
    incrementDownload,
    voteHelpful,
    removeVoteHelpful,
    bookmarkResource,
    removeBookmark,
    getBookmarks,
    rateResource,
    reportResource,
    getRecommendedResources
};
