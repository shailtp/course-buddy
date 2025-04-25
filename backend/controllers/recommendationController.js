const Course = require('../models/Course');
const Professor = require('../models/Professor');


const generateRecommendations = (coursesData, takenCourses, numCourses) => {
    console.log('Using local recommendation algorithm with real data');
    
    // Extract course numbers from taken courses
    const takenCourseNumbers = takenCourses.map(course => course.toUpperCase());
    console.log('Taken course numbers:', takenCourseNumbers);

    // Filter available courses to exclude taken courses
    let availableCourses = coursesData.filter(course => {
        return !takenCourseNumbers.includes(course.course_number.toUpperCase());
    });
    
    console.log(`Found ${availableCourses.length} courses not taken by student`);

    // Check prerequisites
    const eligibleCourses = availableCourses.filter(course => {
        // If no prerequisites or "null" prerequisites, student is eligible
        if (!course.prerequisites || course.prerequisites === "null") {
            return true;
        }
        
        // Simple prerequisite checking logic - assumes prerequisites are in format "CSC 101 and CSC 215"
        const prerequisiteText = course.prerequisites.toUpperCase();
        
        // Check if all prerequisites are satisfied
        const andSplit = prerequisiteText.split(/\s+AND\s+/);
        const orSplit = prerequisiteText.split(/\s+OR\s+/);
        
        // If it contains AND, all courses must be taken
        if (andSplit.length > 1) {
            const requiredCourses = andSplit.map(part => part.trim());
            return requiredCourses.every(req => {
                // Extract course number (handles formats like "CSC 101" in "CSC 101 and CSC 215")
                const courseMatch = req.match(/([A-Z]+\s+\d+)/);
                if (courseMatch) {
                    const courseNumber = courseMatch[1];
                    return takenCourseNumbers.includes(courseNumber);
                }
                return false;
            });
        }
        
        // If it contains OR, at least one course must be taken
        if (orSplit.length > 1) {
            const requiredCourses = orSplit.map(part => part.trim());
            return requiredCourses.some(req => {
                // Extract course number
                const courseMatch = req.match(/([A-Z]+\s+\d+)/);
                if (courseMatch) {
                    const courseNumber = courseMatch[1];
                    return takenCourseNumbers.includes(courseNumber);
                }
                return false;
            });
        }
        
        // Check if a single course prerequisite is met
        const courseMatch = prerequisiteText.match(/([A-Z]+\s+\d+)/g);
        if (courseMatch) {
            return courseMatch.every(course => takenCourseNumbers.includes(course));
        }
        
        // Default to not eligible if prerequisite logic couldn't be parsed
        return false;
    });
    
    console.log(`Found ${eligibleCourses.length} eligible courses (prerequisites satisfied)`);

    // Sort courses by level (lower levels first)
    const sortedCourses = [...eligibleCourses].sort((a, b) => {
        // Extract course number (e.g., "101" from "CSC 101")
        const numA = parseInt(a.course_number.match(/\d+/)[0]);
        const numB = parseInt(b.course_number.match(/\d+/)[0]);
        return numA - numB;
    });

    // Get the best professors for each course
    const recommendations = [];
    
    for (const course of sortedCourses) {
        if (recommendations.length >= numCourses * 3) break; // Get 3x the requested number for "generate another"
        
        // Find the best professor for this course with real data
        const availableProfessors = course.professors.filter(prof => 
            prof && prof.name && prof.name !== "Unknown" && prof.overall_quality
        );
        
        // Check if we have any valid professors
        let bestProfessor;
        if (availableProfessors.length > 0) {
            // Sort by rating and get the best one
            bestProfessor = availableProfessors.sort((a, b) => 
                (b.overall_quality || 0) - (a.overall_quality || 0)
            )[0];
        } else {
            // No valid professor found, use placeholder with "Unknown" name
            bestProfessor = { 
                name: "Unknown", 
                _id: null,
                overall_quality: null,
                would_take_again: null,
                difficulty: null
            };
        }
        
        // Generate a reason for recommendation
        let reason = "";
        
        // Lower level courses (100-200)
        const courseLevel = parseInt(course.course_number.match(/\d+/)[0]);
        
        if (courseLevel < 300) {
            reason = `This is a foundational course that builds on your previous coursework. ${course.course_title} provides essential knowledge for more advanced computer science topics.`;
        } 
        // Mid-level courses (300-400)
        else if (courseLevel < 500) {
            reason = `Having completed your introductory courses, ${course.course_title} offers more specialized knowledge that expands your computer science expertise.`;
        } 
        // Upper-level courses (500+)
        else {
            reason = `This advanced course builds on your strong foundation and will provide specialized knowledge in ${course.course_title}.`;
        }
        
        // Add prerequisites info to reason if applicable
        if (course.prerequisites && course.prerequisites !== "null") {
            reason += ` You've completed the prerequisites (${course.prerequisites}), making this a natural next step.`;
        }
        
        // Only use the placeholder values if we don't have real data
        recommendations.push({
            course_number: course.course_number,
            course_title: course.course_title,
            description: course.description,
            prerequisites: course.prerequisites || "None",
            professor: bestProfessor.name,
            professor_id: bestProfessor._id,
            rmp_link: bestProfessor.rmp_link,
            overall_quality: bestProfessor.overall_quality,
            would_take_again: bestProfessor.would_take_again,
            difficulty: bestProfessor.difficulty,
            reason: reason
        });
    }
    
    console.log(`Generated ${recommendations.length} recommendations from real data`);
    return recommendations;
};

// @desc    Get course recommendations
// @route   POST /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        console.log('=== START: Recommendation Request ===');
        console.log('Received recommendation request:', req.body);
        const { numCourses, takenCourses } = req.body;

        if (!numCourses || !takenCourses) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'Missing required fields: numCourses or takenCourses' });
        }

        // Check if numCourses is valid
        if (isNaN(numCourses) || numCourses < 1 || numCourses > 5) {
            console.log('Invalid numCourses:', numCourses);
            return res.status(400).json({ message: 'numCourses must be between 1 and 5' });
        }

        // Check if takenCourses is valid
        if (!Array.isArray(takenCourses)) {
            console.log('takenCourses is not an array:', takenCourses);
            return res.status(400).json({ message: 'takenCourses must be an array' });
        }

        try {
            // Fetch all courses and professors data
            console.log('Fetching courses from database...');
            const allCourses = await Course.find({}).lean();
            console.log(`Found ${allCourses.length} courses`);
            
            console.log('Fetching professors from database...');
            const allProfessors = await Professor.find({}).lean();
            console.log(`Found ${allProfessors.length} professors`);

            if (allCourses.length === 0) {
                console.log('No courses found in database');
                return res.status(500).json({ message: 'No courses found in the database' });
            }

            // Create a map of professors by their ID for quick lookup
            console.log('Creating professor map...');
            const professorsMap = {};
            allProfessors.forEach(prof => {
                professorsMap[prof._id] = prof;
            });

            // Get a list of available professors to use when needed
            const availableProfessorsArray = Object.values(professorsMap);
            
            // Get the top 5 professors by rating (for backup use)
            const topProfessors = [...availableProfessorsArray]
                .filter(prof => prof.overall_quality)
                .sort((a, b) => (b.overall_quality || 0) - (a.overall_quality || 0))
                .slice(0, 5);
            
            console.log(`Found ${topProfessors.length} top professors for backup use`);

            // Prepare the data for the recommendation algorithm
            console.log('Preparing data for recommendation algorithm...');
            const coursesData = allCourses.map(course => {
                try {
                    // Handle potential missing professors reference
                    const profArray = course.professors || [];
                    
                    // Map professors. If none found, add a top professor as backup
                    const mappedProfessors = profArray.map(profId => {
                        try {
                            const prof = professorsMap[profId];
                            if (prof) {
                                return {
                                    _id: prof._id,
                                    name: prof.name,
                                    overall_quality: prof.overall_quality,
                                    would_take_again: prof.would_take_again,
                                    difficulty: prof.difficulty,
                                    rmp_link: prof.rmp_link
                                };
                            } else {
                                console.log(`Professor with ID ${profId} not found for course ${course.course_number}`);
                                return null;
                            }
                        } catch (profError) {
                            console.error('Error mapping professor:', profError);
                            return null;
                        }
                    }).filter(Boolean); // Remove null entries
                    
                    // If no valid professors were found for this course, add a top professor from our list
                    if (mappedProfessors.length === 0 && topProfessors.length > 0) {
                        // Select a random professor from our top 5
                        const randomIndex = Math.floor(Math.random() * topProfessors.length);
                        const backupProf = topProfessors[randomIndex];
                        
                        console.log(`Added backup professor ${backupProf.name} for course ${course.course_number}`);
                        
                        mappedProfessors.push({
                            _id: backupProf._id,
                            name: backupProf.name,
                            overall_quality: backupProf.overall_quality,
                            would_take_again: backupProf.would_take_again,
                            difficulty: backupProf.difficulty,
                            rmp_link: backupProf.rmp_link
                        });
                    }
                    
                    return {
                        course_number: course.course_number,
                        course_title: course.course_title,
                        prerequisites: course.prerequisites,
                        description: course.description || "",
                        professors: mappedProfessors
                    };
                } catch (courseError) {
                    console.error('Error mapping course:', courseError, course);
                    return null;
                }
            }).filter(course => course && course.professors.length > 0); // Only keep courses with at least one professor

            console.log('Data prepared for recommendation algorithm');

            // Generate recommendations using local algorithm with real data
            const recommendations = generateRecommendations(coursesData, takenCourses, numCourses);
            
            if (recommendations.length === 0) {
                console.log('No eligible courses found for recommendations');
                return res.status(404).json({ message: 'No eligible courses found that match your criteria' });
            }

            // Log sample of recommendations for debugging
            console.log('Sample recommendation:', JSON.stringify(recommendations[0], null, 2));
            console.log('=== END: Recommendation Request Successful ===');
            return res.json(recommendations);
            
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ message: 'Database error: ' + dbError.message });
        }
    } catch (error) {
        console.error('=== ERROR: Recommendation Request Failed ===');
        console.error('Error in getRecommendations:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get all professors
// @route   GET /api/professors
// @access  Public
const getAllProfessors = async (req, res) => {
    try {
        console.log('=== START: Fetch All Professors ===');
        const professors = await Professor.find({}).lean();
        console.log(`Found ${professors.length} professors in database`);
        
        if (professors.length === 0) {
            return res.status(404).json({ message: 'No professors found in the database' });
        }
        
        console.log('=== END: Fetch All Professors Successful ===');
        return res.json(professors);
    } catch (error) {
        console.error('=== ERROR: Fetch All Professors Failed ===');
        console.error('Error in getAllProfessors:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get professor by ID
// @route   GET /api/professors/:id
// @access  Public
const getProfessorById = async (req, res) => {
    try {
        console.log('=== START: Fetch Professor By ID ===');
        console.log('Professor ID:', req.params.id);
        
        const professor = await Professor.findById(req.params.id).lean();
        
        if (!professor) {
            console.log(`Professor with ID ${req.params.id} not found`);
            return res.status(404).json({ message: 'Professor not found' });
        }
        
        console.log('Professor found:', professor.name);
        console.log('=== END: Fetch Professor By ID Successful ===');
        
        return res.json(professor);
    } catch (error) {
        console.error('=== ERROR: Fetch Professor By ID Failed ===');
        console.error('Error in getProfessorById:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
    try {
        console.log('=== START: Fetch All Courses ===');
        const courses = await Course.find({}).lean();
        console.log(`Found ${courses.length} courses in database`);
        
        if (courses.length === 0) {
            return res.status(404).json({ message: 'No courses found in the database' });
        }
        
        console.log('=== END: Fetch All Courses Successful ===');
        return res.json(courses);
    } catch (error) {
        console.error('=== ERROR: Fetch All Courses Failed ===');
        console.error('Error in getAllCourses:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get course by ID or course number
// @route   GET /api/courses/:identifier
// @access  Public
const getCourseByIdentifier = async (req, res) => {
    try {
        console.log('=== START: Fetch Course By Identifier ===');
        const { identifier } = req.params;
        console.log('Course identifier:', identifier);
        
        // Check if the identifier is a MongoDB ObjectId or a course number
        let course;
        
        // First try to find by course number (e.g., "CSC 101")
        course = await Course.findOne({ 
            course_number: { $regex: new RegExp('^' + identifier + '$', 'i') } 
        }).lean();
        
        // If not found, try to find by ID
        if (!course) {
            try {
                course = await Course.findById(identifier).lean();
            } catch (error) {
                // Invalid ObjectId, will be handled by the !course check below
            }
        }
        
        if (!course) {
            console.log(`Course with identifier ${identifier} not found`);
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // If course found, also fetch the professors
        if (course.professors && course.professors.length > 0) {
            const professorDetails = await Professor.find({
                _id: { $in: course.professors }
            }).lean();
            
            course.professorDetails = professorDetails;
        }
        
        console.log('Course found:', course.course_number, course.course_title);
        console.log('=== END: Fetch Course By Identifier Successful ===');
        
        return res.json(course);
    } catch (error) {
        console.error('=== ERROR: Fetch Course By Identifier Failed ===');
        console.error('Error in getCourseByIdentifier:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get courses by professor ID
// @route   GET /api/courses/professor/:id
// @access  Public
const getCoursesByProfessorId = async (req, res) => {
    try {
        console.log('=== START: Fetch Courses By Professor ID ===');
        const { id } = req.params;
        console.log('Professor ID:', id);
        
        // Find all courses that have this professor ID in their professors array
        const courses = await Course.find({
            professors: id
        }).lean();
        
        if (courses.length === 0) {
            console.log(`No courses found for professor with ID ${id}`);
            return res.status(404).json({ message: 'No courses found for this professor' });
        }
        
        // Get the professor details
        const professor = await Professor.findById(id).lean();
        
        console.log(`Found ${courses.length} courses for professor ${professor ? professor.name : id}`);
        console.log('=== END: Fetch Courses By Professor ID Successful ===');
        
        return res.json({
            professor: professor || { _id: id, name: 'Unknown' },
            courses
        });
    } catch (error) {
        console.error('=== ERROR: Fetch Courses By Professor ID Failed ===');
        console.error('Error in getCoursesByProfessorId:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = {
    getRecommendations,
    getAllProfessors,
    getProfessorById,
    getAllCourses,
    getCourseByIdentifier,
    getCoursesByProfessorId
}; 