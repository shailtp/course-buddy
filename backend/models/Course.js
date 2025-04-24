const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    course_number: { 
        type: String, 
        required: true,
        unique: true
    }, // e.g., "CSC 101"
    course_title: { type: String, required: true },  // e.g., "Introduction to Computing"
    prerequisites: {
        type: String,  // Will store prerequisites as a structured string (e.g., "CSC 101 and CSC 215" or "null")
        default: "null"
    },
    description: { type: String },
    professors: [{ 
        type: String,
        ref: 'Professor'  // Reference to Professor model
    }]
}, { timestamps: true });

// Create a compound index for course number and title for efficient lookups
courseSchema.index({ course_number: 1, course_title: 1 });

module.exports = mongoose.model('Course', courseSchema);
