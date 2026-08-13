const Project = require('../models/Project');
const ProjectLike = require('../models/ProjectLike');
const ProjectBookmark = require('../models/ProjectBookmark');
const ProjectCollaborationRequest = require('../models/ProjectCollaborationRequest');
const ProjectFeedback = require('../models/ProjectFeedback');
const ProjectReport = require('../models/ProjectReport');
const ProjectAIAnalysis = require('../models/ProjectAIAnalysis');
const Notification = require('../models/Notification');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');

const slugify = (text) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { title, shortDescription, projectType, domain } = req.body;
        
        let slug = slugify(title, { lower: true, strict: true });
        
        // Ensure slug uniqueness
        let existing = await Project.findOne({ slug, collegeId: req.user.collegeId });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        // Parse JSON strings from FormData if they exist
        let parsedBody = { ...req.body };
        if (typeof parsedBody.technologies === 'string') parsedBody.technologies = JSON.parse(parsedBody.technologies);
        if (typeof parsedBody.skills === 'string') parsedBody.skills = JSON.parse(parsedBody.skills);
        if (typeof parsedBody.features === 'string') parsedBody.features = JSON.parse(parsedBody.features);
        if (typeof parsedBody.architectureDetails === 'string') parsedBody.architectureDetails = JSON.parse(parsedBody.architectureDetails);
        if (typeof parsedBody.teamMembers === 'string') parsedBody.teamMembers = JSON.parse(parsedBody.teamMembers);
        if (typeof parsedBody.collaborationSettings === 'string') parsedBody.collaborationSettings = JSON.parse(parsedBody.collaborationSettings);

        const project = new Project({
            ...parsedBody,
            slug,
            ownerId: req.user._id,
            collegeId: req.user.collegeId,
            status: parsedBody.status || 'In Development',
            visibility: parsedBody.visibility || 'Public'
        });

        // Handle uploaded files
        if (req.files) {
            if (req.files.screenshots) {
                project.screenshots = req.files.screenshots.map(file => file.path.replace(/\\/g, '/'));
            }
            if (req.files.demoVideo && req.files.demoVideo[0]) {
                project.demoVideoUrl = req.files.demoVideo[0].path.replace(/\\/g, '/');
            }
            if (req.files.architectureImage && req.files.architectureImage[0]) {
                project.architectureImage = req.files.architectureImage[0].path.replace(/\\/g, '/');
            }
        }

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update own project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });

        const updatableFields = ['title', 'shortDescription', 'problemStatement', 'proposedSolution', 'projectType', 'domain', 'status', 'githubUrl', 'liveDemoUrl', 'documentationUrl', 'datasetUrl', 'challenges', 'futureImprovements', 'visibility'];
        
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) project[field] = req.body[field];
        });

        // Handle JSON arrays/objects
        if (req.body.technologies) project.technologies = typeof req.body.technologies === 'string' ? JSON.parse(req.body.technologies) : req.body.technologies;
        if (req.body.skills) project.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
        if (req.body.features) project.features = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : req.body.features;
        if (req.body.architectureDetails) project.architectureDetails = typeof req.body.architectureDetails === 'string' ? JSON.parse(req.body.architectureDetails) : req.body.architectureDetails;
        if (req.body.teamMembers) project.teamMembers = typeof req.body.teamMembers === 'string' ? JSON.parse(req.body.teamMembers) : req.body.teamMembers;
        if (req.body.collaborationSettings) project.collaborationSettings = typeof req.body.collaborationSettings === 'string' ? JSON.parse(req.body.collaborationSettings) : req.body.collaborationSettings;

        // Handle uploaded files
        if (req.files) {
            if (req.files.screenshots) {
                // Append new screenshots to existing
                const newScreenshots = req.files.screenshots.map(file => file.path.replace(/\\/g, '/'));
                project.screenshots = [...(project.screenshots || []), ...newScreenshots];
            }
            if (req.files.demoVideo && req.files.demoVideo[0]) {
                project.demoVideoUrl = req.files.demoVideo[0].path.replace(/\\/g, '/');
            }
            if (req.files.architectureImage && req.files.architectureImage[0]) {
                project.architectureImage = req.files.architectureImage[0].path.replace(/\\/g, '/');
            }
        }

        await project.save();
        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get projects (discovery with filtering and pagination)
exports.getProjects = async (req, res) => {
    try {
        const { search, projectType, domain, status, verificationStatus, department, page = 1, limit = 10, sort = 'recent' } = req.query;

        let query = { collegeId: req.user.collegeId, visibility: { $ne: 'Private' } };

        // Ensure users only see published unless they are the owner
        // Since we are discovering, just show non-private. Wait, 'Idea' status might be public but not "Published"? 
        // Let's filter out Archived unless explicitly requested by owner
        query.status = { $ne: 'Archived' };

        if (status) query.status = status;
        if (projectType) query.projectType = projectType;
        if (domain) query.domain = domain;
        if (verificationStatus) query.verificationStatus = verificationStatus;
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { technologies: { $in: [new RegExp(search, 'i')] } },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'mostViewed') sortOption = { viewCount: -1 };
        else if (sort === 'mostLiked') sortOption = { likeCount: -1 };
        else if (sort === 'mostBookmarked') sortOption = { bookmarkCount: -1 };

        const projects = await Project.find(query)
            .populate('ownerId', 'name profilePhoto role department')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Project.countDocuments(query);

        res.json({
            projects,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get project by slug
exports.getProjectBySlug = async (req, res) => {
    try {
        const project = await Project.findOne({ slug: req.params.slug, collegeId: req.user.collegeId })
            .populate('ownerId', 'name profilePhoto role department')
            .populate('teamMembers.userId', 'name profilePhoto role')
            .populate('facultyMentor', 'name profilePhoto');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check visibility
        if (project.visibility === 'Private' && project.ownerId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Increment view count if not owner
        if (project.ownerId._id.toString() !== req.user._id.toString()) {
            project.viewCount += 1;
            await project.save();
        }

        // Get user engagements
        const [like, bookmark] = await Promise.all([
            ProjectLike.findOne({ projectId: project._id, userId: req.user._id }),
            ProjectBookmark.findOne({ projectId: project._id, userId: req.user._id })
        ]);

        const projectData = project.toObject();
        projectData.hasLiked = !!like;
        projectData.hasBookmarked = !!bookmark;

        // Fetch feedback
        projectData.feedback = await ProjectFeedback.find({ projectId: project._id, isPublic: true })
            .populate('alumniId', 'name profilePhoto company jobRole');

        res.json(projectData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Like/Unlike
exports.toggleLike = async (req, res) => {
    try {
        const projectId = req.params.id;
        const existingLike = await ProjectLike.findOne({ projectId, userId: req.user._id });

        if (existingLike) {
            await ProjectLike.findByIdAndDelete(existingLike._id);
            await Project.findByIdAndUpdate(projectId, { $inc: { likeCount: -1 } });
            res.json({ message: 'Unliked successfully' });
        } else {
            await ProjectLike.create({ projectId, userId: req.user._id });
            await Project.findByIdAndUpdate(projectId, { $inc: { likeCount: 1 } });
            res.json({ message: 'Liked successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Bookmark/Unbookmark
exports.toggleBookmark = async (req, res) => {
    try {
        const projectId = req.params.id;
        const existingBookmark = await ProjectBookmark.findOne({ projectId, userId: req.user._id });

        if (existingBookmark) {
            await ProjectBookmark.findByIdAndDelete(existingBookmark._id);
            await Project.findByIdAndUpdate(projectId, { $inc: { bookmarkCount: -1 } });
            res.json({ message: 'Removed bookmark' });
        } else {
            await ProjectBookmark.create({ projectId, userId: req.user._id });
            await Project.findByIdAndUpdate(projectId, { $inc: { bookmarkCount: 1 } });
            res.json({ message: 'Added bookmark' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get bookmarked projects
exports.getBookmarkedProjects = async (req, res) => {
    try {
        const bookmarks = await ProjectBookmark.find({ userId: req.user._id })
            .populate({
                path: 'projectId',
                populate: { path: 'ownerId', select: 'name profilePhoto' }
            });
        
        const projects = bookmarks.map(b => b.projectId).filter(p => p);
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Submit collaboration request
exports.submitCollaborationRequest = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { requestedRole, message } = req.body;
        
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!project.collaborationSettings?.lookingForCollaborators) {
            return res.status(400).json({ message: 'Project is not looking for collaborators' });
        }

        const existing = await ProjectCollaborationRequest.findOne({ projectId, requesterId: req.user._id, requestedRole });
        if (existing) return res.status(400).json({ message: 'You have already requested this role' });

        await ProjectCollaborationRequest.create({
            projectId,
            requesterId: req.user._id,
            requestedRole,
            message
        });

        // Notify owner
        await Notification.create({
            userId: project.ownerId,
            type: 'PROJECT_COLLAB_REQUEST',
            content: `${req.user.name} requested to collaborate on ${project.title} as ${requestedRole}`,
            link: `/projects/${project.slug}/collaboration`
        });

        res.status(201).json({ message: 'Collaboration request sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Alumni Feedback
exports.submitFeedback = async (req, res) => {
    try {
        if (req.user.role !== 'Alumni') return res.status(403).json({ message: 'Only Alumni can submit feedback' });

        const projectId = req.params.id;
        const { technicalDepth, industryRelevance, scalability, clarity, feedback, suggestions, isPublic } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const existing = await ProjectFeedback.findOne({ projectId, alumniId: req.user._id });
        if (existing) {
            Object.assign(existing, { technicalDepth, industryRelevance, scalability, clarity, feedback, suggestions, isPublic });
            await existing.save();
        } else {
            await ProjectFeedback.create({
                projectId,
                alumniId: req.user._id,
                technicalDepth, industryRelevance, scalability, clarity, feedback, suggestions, isPublic
            });
        }

        // Notify owner
        await Notification.create({
            userId: project.ownerId,
            type: 'PROJECT_FEEDBACK',
            content: `Alumni ${req.user.name} provided feedback on your project ${project.title}`,
            link: `/projects/${project.slug}`
        });

        res.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Verify Project (Faculty/Admin)
exports.verifyProject = async (req, res) => {
    try {
        if (!['Faculty', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to verify projects' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.verificationStatus = req.user.role === 'Admin' ? 'Admin Verified' : 'Faculty Verified';
        
        if (req.user.role === 'Faculty') {
            project.facultyMentor = req.user._id;
        }

        await project.save();

        await Notification.create({
            userId: project.ownerId,
            type: 'PROJECT_VERIFIED',
            content: `Your project ${project.title} was verified by ${req.user.name}`,
            link: `/projects/${project.slug}`
        });

        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Report project
exports.reportProject = async (req, res) => {
    try {
        const { reason } = req.body;
        await ProjectReport.create({
            projectId: req.params.id,
            reportedBy: req.user._id,
            reason
        });
        res.status(201).json({ message: 'Report submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// AI Analysis
exports.getAIAnalysis = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Check cache
        const existingAnalysis = await ProjectAIAnalysis.findOne({ projectId });
        if (existingAnalysis) {
            return res.json(existingAnalysis);
        }

        const project = await Project.findById(projectId).populate('ownerId', 'name');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Generate AI analysis
        const prompt = `
            Analyze this software engineering project and return a JSON object (do not include markdown block formatting, just raw JSON).
            Project Title: ${project.title}
            Description: ${project.shortDescription}
            Problem: ${project.problemStatement || 'N/A'}
            Solution: ${project.proposedSolution || 'N/A'}
            Domain: ${project.domain}
            Technologies: ${project.technologies.join(', ')}
            Skills: ${project.skills.join(', ')}
            Architecture: ${JSON.stringify(project.architectureDetails || {})}

            Provide the following JSON structure exactly:
            {
                "technicalComplexity": "High/Medium/Low - short reason",
                "skillsDemonstrated": ["skill1", "skill2"],
                "strengths": ["strength1", "strength2"],
                "potentialWeaknesses": ["weakness1"],
                "recommendedImprovements": ["rec1", "rec2"],
                "scalabilityImprovements": "Description",
                "securityImprovements": "Description",
                "deploymentImprovements": "Description",
                "suggestedResumeDescription": "Professional 2-sentence resume description",
                "potentialInterviewQuestions": [
                    { "question": "Question text", "context": "Why ask this" }
                ]
            }
        `;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'Gemini API Key is missing' });
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const aiResult = await model.generateContent(prompt);
        let aiResponseText = aiResult.response.text();
        aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const aiData = JSON.parse(aiResponseText);

        const newAnalysis = await ProjectAIAnalysis.create({
            projectId,
            ...aiData
        });

        res.json(newAnalysis);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ message: 'Failed to generate AI analysis. The project might not have enough details.' });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });

        await Project.deleteOne({ _id: req.params.id });
        await ProjectLike.deleteMany({ projectId: req.params.id });
        await ProjectBookmark.deleteMany({ projectId: req.params.id });
        await ProjectFeedback.deleteMany({ projectId: req.params.id });
        await ProjectAIAnalysis.deleteMany({ projectId: req.params.id });
        
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
