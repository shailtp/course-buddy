import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PagesCommon.css';
import './Courses.css';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                console.log('Fetching courses from API...');
                const response = await axios.get('http://localhost:5001/api/courses');
                console.log('API Response:', response.data);
                
                // Sort courses by course number
                const sortedCourses = response.data.sort((a, b) => {
                    // Extract the number part (e.g., "101" from "CSC 101")
                    const numA = parseInt(a.course_number.match(/\d+/)[0]);
                    const numB = parseInt(b.course_number.match(/\d+/)[0]);
                    return numA - numB;
                });
                
                setCourses(sortedCourses);
                setError(null);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const fetchCourseDetails = async (courseId) => {
        try {
            setDetailsLoading(true);
            console.log('Fetching course details for:', courseId);
            const response = await axios.get(`http://localhost:5001/api/courses/${courseId}`);
            console.log('Course details:', response.data);
            setCourseDetails(response.data);
        } catch (err) {
            console.error('Error fetching course details:', err);
            // We'll just show what we have without the additional details
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        fetchCourseDetails(course._id);
    };

    const filteredCourses = courses.filter(course => 
        course.course_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.course_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group courses by level
    const groupedCourses = filteredCourses.reduce((acc, course) => {
        // Extract the number part (e.g., "101" from "CSC 101")
        const courseNumber = parseInt(course.course_number.match(/\d+/)[0]);
        
        let level;
        if (courseNumber < 300) level = '100-200 (Lower Division)';
        else if (courseNumber < 500) level = '300-400 (Upper Division)';
        else level = '500+ (Graduate)';
        
        if (!acc[level]) acc[level] = [];
        acc[level].push(course);
        return acc;
    }, {});

    return (
        <div className="page-container">
            <Link to="/dashboard" className="back-to-dashboard">
                ← Back to Dashboard
            </Link>
            <h1>Course Information</h1>
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading courses...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            ) : (
                <div className="courses-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search courses by number or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="courses-grid">
                        <div className="courses-list">
                            {filteredCourses.length > 0 ? (
                                Object.entries(groupedCourses).map(([level, levelCourses]) => (
                                    <div key={level} className="course-level-group">
                                        <h3 className="level-heading">{level}</h3>
                                        {levelCourses.map(course => (
                                            <div
                                                key={course._id}
                                                className={`course-item ${selectedCourse && selectedCourse._id === course._id ? 'selected' : ''}`}
                                                onClick={() => handleCourseClick(course)}
                                            >
                                                <div className="course-number">{course.course_number}</div>
                                                <div className="course-title">{course.course_title}</div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">No courses found matching "{searchTerm}"</div>
                            )}
                        </div>
                        
                        {selectedCourse && (
                            <div className="course-details">
                                {detailsLoading ? (
                                    <div className="loading-container">
                                        <div className="loading-spinner"></div>
                                        <p>Loading course details...</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2>{selectedCourse.course_number}: {selectedCourse.course_title}</h2>
                                        
                                        {selectedCourse.description && (
                                            <div className="description-section">
                                                <h3>Description</h3>
                                                <p>{selectedCourse.description}</p>
                                            </div>
                                        )}
                                        
                                        <div className="prerequisites-section">
                                            <h3>Prerequisites</h3>
                                            <p>{selectedCourse.prerequisites && selectedCourse.prerequisites !== "null" 
                                                ? selectedCourse.prerequisites 
                                                : "None"}
                                            </p>
                                        </div>
                                        
                                        {courseDetails && courseDetails.professorDetails && courseDetails.professorDetails.length > 0 && (
                                            <div className="professors-section">
                                                <h3>Professors</h3>
                                                <div className="professors-grid-list">
                                                    {courseDetails.professorDetails.map(professor => (
                                                        <div key={professor._id} className="professor-card">
                                                            <h4>{professor.name}</h4>
                                                            <div className="professor-stats">
                                                                <div className="stat">
                                                                    <span className="label">Rating:</span>
                                                                    <span className="value">{professor.overall_quality || 'N/A'}</span>
                                                                </div>
                                                                <div className="stat">
                                                                    <span className="label">Would Take Again:</span>
                                                                    <span className="value">{professor.would_take_again ? `${professor.would_take_again}%` : 'N/A'}</span>
                                                                </div>
                                                                <div className="stat">
                                                                    <span className="label">Difficulty:</span>
                                                                    <span className="value">{professor.difficulty || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            {professor.rmp_link && (
                                                                <a 
                                                                    href={professor.rmp_link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="rmp-link-small"
                                                                >
                                                                    View on RMP
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 