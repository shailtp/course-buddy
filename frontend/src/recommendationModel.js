require('dotenv').config();
const OpenAI = require('openai');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Professor = require('../models/Professor');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getRecommendations(userId) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Fetch user data
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const completedCourses = user.completed_courses;

        // Get available courses (filter out completed ones)
        const availableCourses = await Course.find({
            subject_id: { $nin: completedCourses }
        }).populate('professor_id');

        // Format data for LLM
        const courseData = availableCourses.map(course => ({
            subject: course.subject_id,
            professor: course.professor_id.name,
            rating: course.professor_id.average_rating,
            difficulty: course.professor_id.difficulty
        }));

        // Generate LLM prompt
        const prompt = `
        A student has taken these courses: ${completedCourses.join(', ')}.
        Based on their history, recommend courses they should take next.
        Consider professor ratings, course difficulty, and prerequisites.
        Available courses:
        ${courseData.map(c => `${c.subject} - Prof. ${c.professor} (Rating: ${c.rating}, Difficulty: ${c.difficulty})`).join('\n')}
        Return recommendations with explanations.
        `;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: "You are a course advisor." },
                       { role: "user", content: prompt }],
            max_tokens: 500
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error(error);
        return "Error generating recommendations.";
    } finally {
        mongoose.connection.close();
    }
}

module.exports = { getRecommendations };
