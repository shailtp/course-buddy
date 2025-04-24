const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    subject_id: { type: String, required: true },
    professor_id: { type: String, required: true },
    semester: { type: String, required: true },
    credits: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
