const mongoose = require('mongoose');

// MongoDB connection string - use environment variable if available, otherwise use a hardcoded URI for testing
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.yvkan.mongodb.net/course-buddy?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
