const express = require('express');
const router = express.Router();
const { 
    getRecommendations,
    getAllProfessors,
    getProfessorById,
    getAllCourses,
    getCourseByIdentifier,
    getCoursesByProfessorId 
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// Main recommendation route
router.post('/recommendations', protect, getRecommendations);

// Professor routes
router.get('/professors', getAllProfessors);
router.get('/professors/:id', getProfessorById);

// Course routes - order matters! More specific routes first
router.get('/courses/professor/:id', getCoursesByProfessorId);
router.get('/courses/:identifier', getCourseByIdentifier);
router.get('/courses', getAllCourses);

// Export the router
module.exports = router;
