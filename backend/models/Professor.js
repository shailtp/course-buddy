const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    subject_ids: [{ type: String }],
    average_rating: { type: Number },
    difficulty: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Professor', professorSchema);
