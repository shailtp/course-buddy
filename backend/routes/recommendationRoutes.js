const express = require('express');
const router = express.Router();
const { 
    getRecommendations,
    getAllProfessors,
    getProfessorById,
    getAllCourses,
    getCourseByIdentifier,
    getCoursesByProfessorId,
    chatQuery
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// Main recommendation route
router.post('/recommendations', protect, getRecommendations);

// RAG-enhanced chat route
router.post('/chat/query', protect, chatQuery);

// Professor routes
router.get('/professors', getAllProfessors);
router.get('/professors/:id', getProfessorById);

// Course routes
router.get('/courses/professor/:id', getCoursesByProfessorId);
router.get('/courses/:identifier', getCourseByIdentifier);
router.get('/courses', getAllCourses);

// Export the router
module.exports = router;
