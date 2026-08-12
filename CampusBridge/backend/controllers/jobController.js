const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const pdfParse = require('pdf-parse');

let genAI;
if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const calculateMatchScore = (user, job) => {
    if (!user.skills || user.skills.length === 0 || !job.requiredSkills || job.requiredSkills.length === 0) {
        return 0;
    }
    const userSkills = user.skills.map(s => s.toLowerCase().trim());
    const reqSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
    const matched = reqSkills.filter(s => userSkills.includes(s));
    
    const skillScore = (matched.length / reqSkills.length) * 60;
    
    let totalExpYears = 0;
    if (user.experience && user.experience.length > 0) {
        user.experience.forEach(exp => {
            const start = exp.startDate ? new Date(exp.startDate) : new Date();
            const end = exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalExpYears += diffDays / 365.25;
        });
    }
    let expScore = 0;
    if (job.experienceRequired === 0) {
        expScore = 30;
    } else {
        expScore = Math.min((totalExpYears / job.experienceRequired) * 30, 30);
    }
    
    const eduScore = user.branch ? 10 : 0;
    
    return Math.round(skillScore + expScore + eduScore);
};

const calculateNaiveScore = (resumeText, job, user) => {
    let skillScore = 0;
    if (job.requiredSkills && job.requiredSkills.length > 0) {
        const reqSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
        const matched = reqSkills.filter(s => 
            resumeText.includes(s) || 
            (user.skills && user.skills.map(us => us.toLowerCase().trim()).includes(s))
        );
        skillScore = (matched.length / reqSkills.length) * 60;
    } else {
        skillScore = 60;
    }

    const eduScore = user.branch ? 10 : 0;
    
    let expScore = 15;
    if (resumeText.includes('experience') || resumeText.includes('internship') || resumeText.includes('worked')) {
        expScore += 10;
    }

    return Math.min(Math.round(skillScore + expScore + eduScore), 100);
};

const createJob = async (req, res) => {
    try {
        const { title, company, location, type, workMode, description, requiredSkills, experienceRequired } = req.body;
        const job = await Job.create({
            title, company, location, type, workMode, description,
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()),
            experienceRequired: Number(experienceRequired) || 0,
            postedBy: req.user._id,
            collegeId: req.user.collegeId
        });

        if (req.io) {
            const students = await User.find({ collegeId: req.user.collegeId, role: 'Student' });
            
            // Real-time socket event to all students in the college
            req.io.to(`college_${req.user.collegeId}`).emit('newReferral', {
                title: job.title,
                company: job.company,
                postedBy: req.user.name
            });

            // Persist notifications in DB
            if (students.length > 0) {
                const notifs = students.map(s => ({
                    userId: s._id,
                    type: 'SYSTEM',
                    content: `New referral posted: ${job.title} at ${job.company}`,
                    link: `/jobs`
                }));
                await Notification.insertMany(notifs);
            }
        }

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ collegeId: req.user.collegeId })
            .populate('postedBy', 'name email profilePhoto')
            .sort({ createdAt: -1 });

        const jobsWithScores = jobs.map(job => {
            const score = calculateMatchScore(req.user, job);
            return { ...job.toObject(), matchScore: score };
        });

        res.json(jobsWithScores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getJobDetails = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name email profilePhoto');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        const score = calculateMatchScore(req.user, job);
        res.json({ ...job.toObject(), matchScore: score });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const applyJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const existing = await JobApplication.findOne({ jobId: job._id, studentId: req.user._id });
        if (existing) return res.status(400).json({ message: 'Already applied' });

        if (!req.file) {
            return res.status(400).json({ message: 'Resume PDF is required' });
        }
        const resumePath = req.file.path;

        let score = 0;
        let pdfData;
        let resumeText = '';

        try {
            const pdfBuffer = fs.readFileSync(resumePath);
            pdfData = await pdfParse(pdfBuffer);
            resumeText = pdfData.text.toLowerCase();
        } catch (err) {
            console.error('Failed to parse PDF:', err.message);
        }

        if (genAI && resumeText) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
                const prompt = `You are an AI HR assistant. Evaluate the following resume text against the job requirements.
Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.requiredSkills.join(', ')}

Resume Text:
${pdfData.text.substring(0, 5000)} // Truncating to avoid limit issues

Analyze the match based on skills, experience, and relevance. Return ONLY a JSON object with a single key "score" containing an integer from 0 to 100 representing the match percentage. Do not include any markdown formatting or explanation.`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text().trim();
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    score = Number(parsed.score) || 0;
                } else {
                    throw new Error("Invalid AI format");
                }
            } catch (err) {
                console.error('AI matching failed, falling back:', err.message);
                score = calculateNaiveScore(resumeText, job, req.user);
            }
        } else {
            console.log("No GEMINI_API_KEY found or PDF empty, falling back to manual keyword score");
            score = calculateNaiveScore(resumeText, job, req.user);
        }

        const application = await JobApplication.create({
            jobId: job._id,
            studentId: req.user._id,
            resumePath,
            matchScore: score,
            status: 'Applied'
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStudentApplications = async (req, res) => {
    try {
        const apps = await JobApplication.find({ studentId: req.user._id })
            .populate({
                path: 'jobId',
                populate: { path: 'postedBy', select: 'name email' }
            })
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAlumniJobApplicants = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id });
        const jobIds = jobs.map(j => j._id);
        const apps = await JobApplication.find({ jobId: { $in: jobIds } })
            .populate('jobId')
            .populate('studentId', 'name email branch skills experience education profilePhoto')
            .sort({ matchScore: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const app = await JobApplication.findById(req.params.id).populate('jobId');
        if (!app) return res.status(404).json({ message: 'Application not found' });

        app.status = status;
        await app.save();

        if (req.io) {
            let toastMessage = '';
            let notifContent = '';

            if (status === 'Referred') {
                toastMessage = `Congratulations! You were referred for ${app.jobId.title}!`;
                notifContent = `Congratulations! We are thrilled to let you know that you have been successfully referred for the ${app.jobId.title} role. We wish you the best of luck in your application process!`;
            } else if (status === 'Shortlisted') {
                toastMessage = `You were shortlisted for ${app.jobId.title}!`;
                notifContent = `Good news! Your application has been shortlisted for the ${app.jobId.title} role. The referrer is currently reviewing your profile.`;
            } else if (status === 'Declined') {
                toastMessage = `Update on your application for ${app.jobId.title}`;
                notifContent = `We are grateful for you showing interest in the ${app.jobId.title} role. Unfortunately, you were not selected for a referral at this time. We wish you the best in your future endeavors!`;
            }

            if (toastMessage) {
                // Real-time socket event to the student
                req.io.to(app.studentId.toString()).emit('referralStatusUpdate', {
                    message: toastMessage,
                    jobId: app.jobId._id
                });

                // Persist notification in DB
                await Notification.create({
                    userId: app.studentId,
                    type: 'SYSTEM',
                    content: notifContent,
                    link: `/jobs`
                });
            }
        }

        res.json(app);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this job' });
        }

        // Delete associated applications
        await JobApplication.deleteMany({ jobId: job._id });
        
        // Delete the job itself
        await Job.findByIdAndDelete(req.params.id);

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobDetails,
    applyJob,
    getStudentApplications,
    getAlumniJobApplicants,
    updateApplicationStatus,
    deleteJob
};
