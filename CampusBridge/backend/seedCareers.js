const mongoose = require('mongoose');
require('dotenv').config();
const CareerRole = require('./models/CareerRole');

const roles = [
    {
        name: 'Software Engineer',
        description: 'Designs, develops, and maintains software applications.',
        domain: 'Engineering',
        requiredSkills: [
            { skillName: 'Data Structures & Algorithms', expectedLevel: 3, importance: 'Critical', category: 'Computer Science' },
            { skillName: 'System Design', expectedLevel: 2, importance: 'High', category: 'Architecture' },
            { skillName: 'Git', expectedLevel: 3, importance: 'High', category: 'Tools' },
            { skillName: 'Database Management', expectedLevel: 3, importance: 'High', category: 'Backend' },
            { skillName: 'REST APIs', expectedLevel: 3, importance: 'High', category: 'Backend' }
        ],
        preferredSkills: [
            { skillName: 'Docker', expectedLevel: 2, importance: 'Medium', category: 'DevOps' },
            { skillName: 'CI/CD', expectedLevel: 2, importance: 'Medium', category: 'DevOps' }
        ],
        experienceLevel: 'Entry',
        recommendedProjectTypes: ['REST API', 'Full Stack App', 'System Clone'],
        interviewTopics: ['Arrays & Strings', 'Trees & Graphs', 'System Architecture', 'SQL vs NoSQL']
    },
    {
        name: 'Frontend Developer',
        description: 'Builds user interfaces and web experiences.',
        domain: 'Engineering',
        requiredSkills: [
            { skillName: 'HTML/CSS', expectedLevel: 4, importance: 'Critical', category: 'Frontend' },
            { skillName: 'JavaScript', expectedLevel: 4, importance: 'Critical', category: 'Frontend' },
            { skillName: 'React', expectedLevel: 3, importance: 'High', category: 'Frontend' },
            { skillName: 'Responsive Design', expectedLevel: 3, importance: 'High', category: 'Design' }
        ],
        preferredSkills: [
            { skillName: 'TypeScript', expectedLevel: 3, importance: 'High', category: 'Frontend' },
            { skillName: 'State Management (Redux/Context)', expectedLevel: 3, importance: 'Medium', category: 'Frontend' },
            { skillName: 'Web Performance', expectedLevel: 2, importance: 'Medium', category: 'Frontend' }
        ],
        experienceLevel: 'Entry',
        recommendedProjectTypes: ['E-commerce UI', 'Dashboard', 'Portfolio Web App'],
        interviewTopics: ['DOM Manipulation', 'Event Loop', 'React Lifecycle', 'CSS Specificity']
    },
    {
        name: 'Data Scientist',
        description: 'Analyzes data and builds machine learning models.',
        domain: 'Data Science',
        requiredSkills: [
            { skillName: 'Python', expectedLevel: 4, importance: 'Critical', category: 'Programming' },
            { skillName: 'SQL', expectedLevel: 3, importance: 'Critical', category: 'Database' },
            { skillName: 'Statistics', expectedLevel: 3, importance: 'High', category: 'Math' },
            { skillName: 'Machine Learning', expectedLevel: 2, importance: 'High', category: 'AI/ML' }
        ],
        preferredSkills: [
            { skillName: 'Deep Learning', expectedLevel: 2, importance: 'Medium', category: 'AI/ML' },
            { skillName: 'Data Visualization', expectedLevel: 3, importance: 'Medium', category: 'Data' }
        ],
        experienceLevel: 'Entry',
        recommendedProjectTypes: ['Predictive Model', 'Data Dashboard', 'Recommendation System'],
        interviewTopics: ['Probability', 'Regression', 'Classification Metrics', 'Python Pandas']
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusbridge')
    .then(async () => {
        console.log('MongoDB Connected');
        await CareerRole.deleteMany({});
        await CareerRole.insertMany(roles);
        console.log('Career roles seeded successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
