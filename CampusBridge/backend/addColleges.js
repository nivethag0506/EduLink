const mongoose = require('mongoose');
require('dotenv').config();

const College = require('./models/College');

const addColleges = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusbridge');
        console.log('Connected to MongoDB');

        // New colleges to add
        const newColleges = [
            {
                name: 'Kongu Engineering College',
                code: 'KEC2024',
                domain: 'kongu.ac.in',
                logo: ''
            },
            {
                name: 'Bannari Amman Institute of Technology',
                code: 'BIT2024',
                domain: 'bitsathy.ac.in',
                logo: ''
            },
            {
                name: 'Rathinam Institute of Technology',
                code: 'RIT2024',
                domain: 'rathinamcollege.edu.in',
                logo: ''
            }
        ];

        // Insert them into the database
        const result = await College.insertMany(newColleges);
        console.log(`✅ Successfully added ${result.length} new colleges to the database:`);
        result.forEach(c => console.log(` - ${c.name}`));

        process.exit(0);
    } catch (error) {
        console.error('Error adding colleges:', error);
        process.exit(1);
    }
};

addColleges();
