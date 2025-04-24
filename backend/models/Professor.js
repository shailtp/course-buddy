const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    courses_offered: [{ type: String }],  // List of course codes (e.g., "CSC 101", "CSC 256")
    overall_quality: { 
        type: Number,
        min: 0,
        max: 5,
        default: null
    },
    would_take_again: { 
        type: Number,  // Percentage (0-100)
        min: 0,
        max: 100,
        default: null
    },
    difficulty: { 
        type: Number,
        min: 0,
        max: 5,
        default: null
    },
    rmp_link: { type: String },  // RateMyProfessors profile link
}, { timestamps: true });

module.exports = mongoose.model('Professor', professorSchema);
