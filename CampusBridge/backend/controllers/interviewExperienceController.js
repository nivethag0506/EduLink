const InterviewExperience = require('../models/InterviewExperience');
const InterviewExperienceVote = require('../models/InterviewExperienceVote');
const InterviewExperienceBookmark = require('../models/InterviewExperienceBookmark');
const InterviewExperienceReport = require('../models/InterviewExperienceReport');
const InterviewInsight = require('../models/InterviewInsight');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get all experiences with filters and pagination
const getExperiences = async (req, res) => {
    try {
        const { page = 1, limit = 10, companyName, role, department, interviewYear, difficulty, result, sort = 'recent' } = req.query;
        
        const filter = { collegeId: req.user.collegeId, status: 'Published' };
        
        if (companyName) filter.companyName = { $regex: companyName, $options: 'i' };
        if (role) filter.role = { $regex: role, $options: 'i' };
        if (department) filter.department = { $regex: department, $options: 'i' };
        if (interviewYear) filter.interviewYear = Number(interviewYear);
        if (difficulty) filter.overallDifficulty = difficulty;
        if (result) filter.result = result;

        const skip = (Number(page) - 1) * Number(limit);
        
        let sortOption = { createdAt: -1 };
        if (sort === 'helpful') sortOption = { helpfulCount: -1, createdAt: -1 };

        const total = await InterviewExperience.countDocuments(filter);
        const experiences = await InterviewExperience.find(filter)
            .populate('authorId', 'name profilePhoto role')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        // Anonymize if needed
        const processedExperiences = experiences.map(exp => {
            if (exp.isAnonymous) {
                exp.authorId = { name: 'Anonymous', profilePhoto: null, role: 'Unknown' };
            }
            return exp;
        });

        res.json({
            experiences: processedExperiences,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalExperiences: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single experience by ID
const getExperienceById = async (req, res) => {
    try {
        const experience = await InterviewExperience.findById(req.params.id)
            .populate('authorId', 'name profilePhoto role');
            
        if (!experience) return res.status(404).json({ message: 'Experience not found' });
        
        if (experience.collegeId.toString() !== req.user.collegeId.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this experience' });
        }
        
        if (experience.isAnonymous) {
            experience.authorId = { name: 'Anonymous', profilePhoto: null, role: 'Unknown' };
        }

        // Check if current user has voted or bookmarked
        const hasVoted = await InterviewExperienceVote.exists({ experienceId: experience._id, userId: req.user._id });
        const hasBookmarked = await InterviewExperienceBookmark.exists({ experienceId: experience._id, userId: req.user._id });

        res.json({ 
            ...experience.toObject(), 
            hasVoted: !!hasVoted, 
            hasBookmarked: !!hasBookmarked 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit a new experience
const createExperience = async (req, res) => {
    try {
        const { companyName, role, department, graduationYear, interviewYear, interviewType, result, overallDifficulty, preparationDuration, preparationResources, overallExperience, adviceForStudents, isAnonymous, rounds } = req.body;
        
        const experience = await InterviewExperience.create({
            authorId: req.user._id,
            collegeId: req.user.collegeId,
            companyName,
            role,
            department,
            graduationYear,
            interviewYear,
            interviewType,
            result,
            overallDifficulty,
            preparationDuration,
            preparationResources,
            overallExperience,
            adviceForStudents,
            isAnonymous,
            rounds
        });
        
        res.status(201).json(experience);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing experience
const updateExperience = async (req, res) => {
    try {
        const experience = await InterviewExperience.findById(req.params.id);
        
        if (!experience) return res.status(404).json({ message: 'Experience not found' });
        
        if (experience.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this experience' });
        }

        const updatedExperience = await InterviewExperience.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedExperience);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an experience
const deleteExperience = async (req, res) => {
    try {
        const experience = await InterviewExperience.findById(req.params.id);
        
        if (!experience) return res.status(404).json({ message: 'Experience not found' });
        
        if (experience.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this experience' });
        }

        await experience.deleteOne();
        
        // Clean up related votes, bookmarks, reports
        await InterviewExperienceVote.deleteMany({ experienceId: experience._id });
        await InterviewExperienceBookmark.deleteMany({ experienceId: experience._id });
        await InterviewExperienceReport.deleteMany({ experienceId: experience._id });

        res.json({ message: 'Experience removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vote helpful
const voteHelpful = async (req, res) => {
    try {
        const experienceId = req.params.id;
        const userId = req.user._id;

        const existingVote = await InterviewExperienceVote.findOne({ experienceId, userId });
        if (existingVote) return res.status(400).json({ message: 'Already voted helpful' });

        await InterviewExperienceVote.create({ experienceId, userId });
        await InterviewExperience.findByIdAndUpdate(experienceId, { $inc: { helpfulCount: 1 } });

        res.json({ message: 'Vote recorded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove helpful vote
const removeVoteHelpful = async (req, res) => {
    try {
        const experienceId = req.params.id;
        const userId = req.user._id;

        const existingVote = await InterviewExperienceVote.findOne({ experienceId, userId });
        if (!existingVote) return res.status(400).json({ message: 'Not voted yet' });

        await existingVote.deleteOne();
        await InterviewExperience.findByIdAndUpdate(experienceId, { $inc: { helpfulCount: -1 } });

        res.json({ message: 'Vote removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bookmark experience
const bookmarkExperience = async (req, res) => {
    try {
        const experienceId = req.params.id;
        const userId = req.user._id;

        const existingBookmark = await InterviewExperienceBookmark.findOne({ experienceId, userId });
        if (existingBookmark) return res.status(400).json({ message: 'Already bookmarked' });

        await InterviewExperienceBookmark.create({ experienceId, userId });
        await InterviewExperience.findByIdAndUpdate(experienceId, { $inc: { bookmarkCount: 1 } });

        res.json({ message: 'Bookmarked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove bookmark
const removeBookmark = async (req, res) => {
    try {
        const experienceId = req.params.id;
        const userId = req.user._id;

        const existingBookmark = await InterviewExperienceBookmark.findOne({ experienceId, userId });
        if (!existingBookmark) return res.status(400).json({ message: 'Not bookmarked' });

        await existingBookmark.deleteOne();
        await InterviewExperience.findByIdAndUpdate(experienceId, { $inc: { bookmarkCount: -1 } });

        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get bookmarks
const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await InterviewExperienceBookmark.find({ userId: req.user._id })
            .populate({
                path: 'experienceId',
                populate: { path: 'authorId', select: 'name profilePhoto role' }
            });

        const experiences = bookmarks.map(b => {
            const exp = b.experienceId;
            if (exp && exp.isAnonymous) {
                exp.authorId = { name: 'Anonymous', profilePhoto: null, role: 'Unknown' };
            }
            return exp;
        }).filter(exp => exp !== null);

        res.json(experiences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Report experience
const reportExperience = async (req, res) => {
    try {
        const experienceId = req.params.id;
        const userId = req.user._id;
        const { reason } = req.body;

        const existingReport = await InterviewExperienceReport.findOne({ experienceId, userId });
        if (existingReport) return res.status(400).json({ message: 'You have already reported this experience' });

        await InterviewExperienceReport.create({ experienceId, userId, reason });
        await InterviewExperience.findByIdAndUpdate(experienceId, { $inc: { reportCount: 1 } });

        res.json({ message: 'Report submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// AI Insights generator
const getAiInsights = async (req, res) => {
    try {
        const { companyName, role } = req.query;
        if (!companyName || !role) return res.status(400).json({ message: 'Company Name and Role are required' });

        // Check if cached insight exists and is fresh (e.g. within last 7 days)
        const cachedInsight = await InterviewInsight.findOne({ collegeId: req.user.collegeId, companyName, role });
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // Also check if we have enough experiences to bother generating insight
        const experienceCount = await InterviewExperience.countDocuments({ collegeId: req.user.collegeId, companyName, role, status: 'Published' });
        
        if (experienceCount === 0) {
            return res.json(null); // No insights possible
        }

        // If cached insight exists, is fresh, and based on same number of experiences, return it
        if (cachedInsight && cachedInsight.lastUpdated > sevenDaysAgo && cachedInsight.basedOnExperienceCount === experienceCount) {
            return res.json(cachedInsight);
        }

        // Generate new insights using Gemini
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'AI processing is currently unavailable.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Fetch up to 10 latest experiences for the prompt (to avoid token limit)
        const experiences = await InterviewExperience.find({ collegeId: req.user.collegeId, companyName, role, status: 'Published' })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('overallDifficulty preparationResources overallExperience adviceForStudents rounds');

        // Prepare context
        const contextData = experiences.map(exp => {
            return `
                Difficulty: ${exp.overallDifficulty}
                Resources: ${exp.preparationResources.join(', ')}
                Advice: ${exp.adviceForStudents}
                Experience: ${exp.overallExperience}
                Rounds: ${exp.rounds.map(r => `${r.roundType} - ${r.topics.join(', ')}`).join('; ')}
            `;
        }).join('\n\n');

        const prompt = `
            Analyze the following interview experiences for the role of ${role} at ${companyName}.
            These are submitted by students. Summarize the recurring patterns and return the output in STRICT JSON format with exactly these keys and data types:
            {
                "mostCommonTopics": ["topic1", "topic2", ... max 5],
                "commonInterviewRounds": ["round1", "round2", ... max 4],
                "frequentlyMentionedSkills": ["skill1", "skill2", ... max 5],
                "commonPreparationResources": ["resource1", "resource2", ... max 5],
                "generalRecommendations": "A short summary paragraph of advice based ONLY on these experiences"
            }
            
            Do NOT invent any information. Only use what is provided in the experiences below.
            If there is not enough data for a field, provide an empty array or empty string.
            
            Experiences Data:
            ${contextData}
        `;

        const aiResult = await model.generateContent(prompt);
        const responseText = aiResult.response.text();
        
        // Parse JSON safely
        let parsedData = {};
        try {
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error("AI JSON Parse Error:", e, responseText);
            // Fallback if parsing fails
            return res.json(cachedInsight || null);
        }

        // Calculate difficulty distribution
        const difficultyDistribution = { easy: 0, medium: 0, hard: 0 };
        experiences.forEach(exp => {
            if (exp.overallDifficulty === 'Easy') difficultyDistribution.easy++;
            if (exp.overallDifficulty === 'Medium') difficultyDistribution.medium++;
            if (exp.overallDifficulty === 'Hard') difficultyDistribution.hard++;
        });

        const newInsightData = {
            collegeId: req.user.collegeId,
            companyName,
            role,
            mostCommonTopics: parsedData.mostCommonTopics || [],
            commonInterviewRounds: parsedData.commonInterviewRounds || [],
            frequentlyMentionedSkills: parsedData.frequentlyMentionedSkills || [],
            difficultyDistribution,
            commonPreparationResources: parsedData.commonPreparationResources || [],
            generalRecommendations: parsedData.generalRecommendations || "",
            basedOnExperienceCount: experienceCount,
            lastUpdated: new Date()
        };

        // Upsert
        const savedInsight = await InterviewInsight.findOneAndUpdate(
            { collegeId: req.user.collegeId, companyName, role },
            newInsightData,
            { new: true, upsert: true }
        );

        res.json(savedInsight);

    } catch (error) {
        console.error("AI Insights Error:", error);
        res.status(500).json({ message: 'Failed to generate AI insights' });
    }
};

module.exports = {
    getExperiences,
    getExperienceById,
    createExperience,
    updateExperience,
    deleteExperience,
    voteHelpful,
    removeVoteHelpful,
    bookmarkExperience,
    removeBookmark,
    getBookmarks,
    reportExperience,
    getAiInsights
};
