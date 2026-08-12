const CareerRole = require('../models/CareerRole');
const StudentSkillProfile = require('../models/StudentSkillProfile');
const CareerRoadmap = require('../models/CareerRoadmap');
const CareerReadinessSnapshot = require('../models/CareerReadinessSnapshot');
const User = require('../models/User');
const Project = require('../models/Project');
const Job = require('../models/Job');
const Resource = require('../models/Resource');
const InterviewExperience = require('../models/InterviewExperience');
const Notification = require('../models/Notification');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Get Available Career Roles
exports.getTargetRoles = async (req, res) => {
    try {
        const roles = await CareerRole.find().select('-createdAt -updatedAt');
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Set Target Role
exports.setTargetRole = async (req, res) => {
    try {
        const { roleId } = req.body;
        const role = await CareerRole.findById(roleId);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        let profile = await StudentSkillProfile.findOne({ userId: req.user._id });
        if (!profile) {
            profile = new StudentSkillProfile({ userId: req.user._id, targetRoleId: roleId, skills: [] });
        } else {
            profile.targetRoleId = roleId;
            // Clear existing analysis because target changed
            profile.topSkillGaps = [];
            profile.readinessScore = 0;
            profile.lastAnalyzedAt = null;
        }
        await profile.save();

        // Clear existing roadmap
        await CareerRoadmap.findOneAndDelete({ userId: req.user._id });

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Main Analyzer Function (Hybrid AI + Deterministic)
exports.analyzeProfile = async (req, res) => {
    try {
        const profile = await StudentSkillProfile.findOne({ userId: req.user._id }).populate('targetRoleId');
        if (!profile || !profile.targetRoleId) {
            return res.status(400).json({ message: 'Please select a target career first.' });
        }

        const targetRole = profile.targetRoleId;
        const user = await User.findById(req.user._id);
        const projects = await Project.find({ ownerId: req.user._id, status: { $ne: 'Idea' } });

        // Build data payload for AI to evaluate
        const userDataForAI = {
            profileSkills: user.skills,
            education: user.education,
            experience: user.experience,
            projects: projects.map(p => ({
                title: p.title,
                description: p.shortDescription,
                technologies: p.technologies,
                skills: p.skills,
                architecture: p.architectureDetails
            }))
        };

        const requiredSkillsList = targetRole.requiredSkills.map(s => s.skillName).join(', ');

        const prompt = `
            You are a technical career coach. Evaluate the proficiency of a student in specific skills based on their profile data.
            Target Career: ${targetRole.name}
            Target Skills to Evaluate: ${requiredSkillsList}
            
            Student Data:
            ${JSON.stringify(userDataForAI)}

            Evaluate each target skill on a proficiency scale of 1 to 4:
            1: Beginner (no evidence or basic profile mention)
            2: Intermediate (used in small projects or coursework)
            3: Advanced (used in complex projects, internships, architecture details)
            4: Expert (extensive verified experience, production systems)

            Return ONLY a valid JSON array (no markdown blocks, no explanation) of objects with this structure:
            [
                { 
                    "skillName": "skill", 
                    "currentLevel": 2, 
                    "source": "Project", // Where you found the strongest evidence (Profile, Project, Resume, AI Assessment)
                    "confidence": "Medium" // Low, Medium, High
                }
            ]
            If there is no evidence for a skill, assign currentLevel: 1, source: "AI Assessment", confidence: "Low".
        `;

        let aiSkillAssessment = [];
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            aiSkillAssessment = JSON.parse(responseText);
        } catch (aiError) {
            console.error("AI Skill Extraction Failed:", aiError);
            // Deterministic fallback if AI fails: assume level 1 for everything except if it matches a skill string exactly
            aiSkillAssessment = targetRole.requiredSkills.map(reqSkill => ({
                skillName: reqSkill.skillName,
                currentLevel: user.skills.includes(reqSkill.skillName) ? 2 : 1,
                source: "Profile",
                confidence: "Low"
            }));
        }

        // --- Deterministic Gap Calculation ---
        let totalRequired = 0;
        let totalCurrent = 0;
        const skillGaps = [];

        targetRole.requiredSkills.forEach(reqSkill => {
            const assessed = aiSkillAssessment.find(a => a.skillName.toLowerCase() === reqSkill.skillName.toLowerCase()) || { currentLevel: 1 };
            
            totalRequired += reqSkill.expectedLevel;
            totalCurrent += Math.min(assessed.currentLevel, reqSkill.expectedLevel); // Cap at required level for score

            const gap = reqSkill.expectedLevel - assessed.currentLevel;
            if (gap > 0) {
                // Priority logic: High gap + Critical importance = Critical
                let priority = 'Medium';
                if (gap >= 2 && reqSkill.importance === 'Critical') priority = 'Critical';
                else if (gap >= 1 && reqSkill.importance === 'Critical') priority = 'High';
                else if (gap >= 2 && reqSkill.importance === 'High') priority = 'High';
                else if (gap === 1 && reqSkill.importance === 'High') priority = 'Medium';
                else priority = 'Low';

                skillGaps.push({
                    skillName: reqSkill.skillName,
                    currentLevel: assessed.currentLevel,
                    requiredLevel: reqSkill.expectedLevel,
                    priority,
                    reason: `Required level is ${reqSkill.expectedLevel} (${reqSkill.importance} importance for ${targetRole.name}), but current assessed level is ${assessed.currentLevel}.`
                });
            }
        });

        // Calculate Readiness Score
        const technicalScore = Math.round((totalCurrent / totalRequired) * 100);
        const projectsScore = projects.length > 2 ? 100 : (projects.length * 33);
        const experienceScore = user.experience.length > 0 ? 100 : 0;
        
        // Weighted overall score
        const overallScore = Math.round((technicalScore * 0.7) + (projectsScore * 0.2) + (experienceScore * 0.1));

        // Sort gaps by priority
        const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        skillGaps.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

        // Update StudentSkillProfile
        profile.skills = aiSkillAssessment;
        profile.readinessScore = overallScore;
        profile.scoreBreakdown = { technicalSkills: technicalScore, projects: projectsScore, experience: experienceScore };
        profile.topSkillGaps = skillGaps;
        profile.lastAnalyzedAt = new Date();
        await profile.save();

        // Save historical snapshot
        await CareerReadinessSnapshot.create({
            userId: req.user._id,
            targetRoleId: targetRole._id,
            readinessScore: overallScore,
            scoreBreakdown: profile.scoreBreakdown
        });

        // --- Deterministic Roadmap Generation ---
        const milestones = [];
        let currentPhase = 1;

        // Group gaps by priority to form phases
        const groupedGaps = {
            'Critical': skillGaps.filter(g => g.priority === 'Critical'),
            'High': skillGaps.filter(g => g.priority === 'High'),
            'Medium': skillGaps.filter(g => g.priority === 'Medium'),
            'Low': skillGaps.filter(g => g.priority === 'Low')
        };

        const generateMilestonesForGroup = (group, phaseNamePrefix) => {
            group.forEach(gap => {
                milestones.push({
                    phase: currentPhase,
                    phaseName: `${phaseNamePrefix} Phase`,
                    skillName: gap.skillName,
                    learningObjective: `Upgrade ${gap.skillName} from level ${gap.currentLevel} to ${gap.requiredLevel}`,
                    whyItMatters: gap.reason,
                    status: 'Not Started',
                    estimatedEffort: (gap.requiredLevel - gap.currentLevel) > 1 ? '3-4 weeks' : '1-2 weeks'
                });
            });
            if (group.length > 0) currentPhase++;
        };

        generateMilestonesForGroup(groupedGaps['Critical'], 'Core Fundamentals');
        generateMilestonesForGroup(groupedGaps['High'], 'Advanced Development');
        generateMilestonesForGroup(groupedGaps['Medium'], 'Skill Polish');

        let roadmap = await CareerRoadmap.findOne({ userId: req.user._id });
        if (!roadmap) {
            roadmap = new CareerRoadmap({ userId: req.user._id, targetRoleId: targetRole._id, milestones });
        } else {
            // Preserve completed statuses where possible
            milestones.forEach(newM => {
                const existingM = roadmap.milestones.find(m => m.skillName === newM.skillName);
                if (existingM) newM.status = existingM.status;
            });
            roadmap.milestones = milestones;
            roadmap.targetRoleId = targetRole._id;
        }
        
        roadmap.completionPercentage = milestones.length === 0 ? 100 : Math.round((milestones.filter(m => m.status === 'Completed').length / milestones.length) * 100);
        await roadmap.save();

        // Notify user if score is high
        if (overallScore > 80) {
            await Notification.create({
                userId: req.user._id,
                type: 'SYSTEM',
                content: `You are highly ready for a ${targetRole.name} role! Start applying for jobs.`,
                link: '/job-board'
            });
        }

        res.json({ profile, roadmap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. Get Dashboard Data
exports.getDashboard = async (req, res) => {
    try {
        const profile = await StudentSkillProfile.findOne({ userId: req.user._id }).populate('targetRoleId');
        if (!profile) return res.json(null);

        const roadmap = await CareerRoadmap.findOne({ userId: req.user._id });
        
        // Fetch snapshot history for chart
        const history = await CareerReadinessSnapshot.find({ userId: req.user._id }).sort({ date: 1 }).limit(10);

        res.json({ profile, roadmap, history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 5. Update Roadmap Progress
exports.updateRoadmapProgress = async (req, res) => {
    try {
        const { milestoneId, status } = req.body;
        const roadmap = await CareerRoadmap.findOne({ userId: req.user._id });
        if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

        const milestone = roadmap.milestones.id(milestoneId);
        if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

        milestone.status = status;
        if (status === 'Completed') milestone.completionDate = new Date();

        const completedCount = roadmap.milestones.filter(m => m.status === 'Completed').length;
        roadmap.completionPercentage = Math.round((completedCount / roadmap.milestones.length) * 100);
        
        await roadmap.save();
        res.json(roadmap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 6. Recommendation Engines (Jobs, Resources, Mentors, Projects)
exports.getRecommendations = async (req, res) => {
    try {
        const { type } = req.params; // 'jobs', 'resources', 'mentors', 'projects', 'interviews'
        const profile = await StudentSkillProfile.findOne({ userId: req.user._id }).populate('targetRoleId');
        if (!profile || !profile.targetRoleId) return res.json([]);

        // Extract skills to search for based on gaps
        const topGaps = profile.topSkillGaps.slice(0, 3).map(g => new RegExp(g.skillName, 'i'));
        const targetRoleName = new RegExp(profile.targetRoleId.name, 'i');

        if (topGaps.length === 0) topGaps.push(targetRoleName); // fallback if no gaps

        switch (type) {
            case 'jobs':
                const jobs = await Job.find({ 
                    collegeId: req.user.collegeId,
                    $or: [
                        { title: targetRoleName },
                        { requiredSkills: { $in: topGaps } }
                    ]
                }).limit(5).populate('postedBy', 'name company');
                return res.json(jobs);
                
            case 'resources':
                const resources = await Resource.find({
                    collegeId: req.user.collegeId,
                    $or: [
                        { title: { $in: topGaps } },
                        { tags: { $in: topGaps } },
                        { category: 'Course Materials' } // generic fallback
                    ]
                }).sort({ helpfulVotes: -1 }).limit(5);
                return res.json(resources);

            case 'mentors':
                const mentors = await User.find({
                    collegeId: req.user.collegeId,
                    role: 'Alumni',
                    $or: [
                        { 'experience.title': targetRoleName },
                        { skills: { $in: topGaps } }
                    ]
                }).select('name profilePhoto experience skills').limit(5);
                return res.json(mentors);

            case 'projects':
                const projects = await Project.find({
                    collegeId: req.user.collegeId,
                    status: { $ne: 'Idea' },
                    visibility: { $ne: 'Private' },
                    $or: [
                        { technologies: { $in: topGaps } },
                        { skills: { $in: topGaps } }
                    ]
                }).sort({ likeCount: -1 }).limit(5).populate('ownerId', 'name profilePhoto');
                return res.json(projects);

            case 'interviews':
                const interviews = await InterviewExperience.find({
                    collegeId: req.user.collegeId,
                    $or: [
                        { role: targetRoleName },
                        { technicalTopics: { $in: topGaps } }
                    ]
                }).limit(5).populate('studentId', 'name profilePhoto');
                return res.json(interviews);

            default:
                return res.status(400).json({ message: 'Invalid recommendation type' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
