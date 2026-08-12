const mongoose = require('mongoose');
require('dotenv').config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.drop();
            console.log(`Dropped collection: ${collection.collectionName}`);
        }
        console.log('Database cleared successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearDB();
