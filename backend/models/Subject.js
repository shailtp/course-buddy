const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    prerequisites: [{ type: String }],
    professors: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
