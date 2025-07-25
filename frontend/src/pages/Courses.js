import React, { useState, useEffect, useRef } from 'react';
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
    const courseRefs = useRef({});

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5001/api/courses');
                const sortedCourses = response.data.sort((a, b) => {
                    const numA = parseInt(a.course_number.match(/\d+/)[0]);
                    const numB = parseInt(b.course_number.match(/\d+/)[0]);
                    return numA - numB;
                });
                setCourses(sortedCourses);
                setError(null);
            } catch (err) {
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
            const response = await axios.get(`http://localhost:5001/api/courses/${courseId}`);
            setCourseDetails(response.data);
        } catch (err) {
            // We'll just show what we have without the additional details
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        fetchCourseDetails(course._id);
        setTimeout(() => {
            if (courseRefs.current[course._id]) {
                courseRefs.current[course._id].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const filteredCourses = courses.filter(course => 
        course.course_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.course_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="simple-courses-page-fixed">
            <div className="simple-courses-header">
                <Link to="/dashboard" className="back-to-dashboard">
                    ← Back to Dashboard
                </Link>
                <h1>Course Information</h1>
                <div className="simple-search-container">
                    <input
                        type="text"
                        placeholder="Search courses by number or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="simple-search-input"
                    />
                </div>
            </div>
            <div className="simple-courses-scrollable">
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
                    <>
                        <div className="simple-courses-list">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map(course => (
                                    <div
                                        key={course._id}
                                        className={`simple-course-item${selectedCourse && selectedCourse._id === course._id ? ' selected' : ''}`}
                                        onClick={() => handleCourseClick(course)}
                                        ref={el => courseRefs.current[course._id] = el}
                                    >
                                        <div className="simple-course-row">
                                            <span className="simple-course-number">{course.course_number}</span>
                                            <span className="simple-course-title">{course.course_title}</span>
                                        </div>
                                        {course.description && (
                                            <div className="simple-course-desc">{course.description}</div>
                                        )}
                                        {course.professors && course.professors.length > 0 && (
                                            <div className="simple-course-profs">
                                                <span className="prof-label">Professors:</span> {course.professors.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">No courses found matching "{searchTerm}"</div>
                            )}
                        </div>
                        {selectedCourse && (
                            <div className="simple-course-details">
                                {detailsLoading ? (
                                    <div className="loading-container">
                                        <div className="loading-spinner"></div>
                                        <p>Loading course details...</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2>{selectedCourse.course_number}: {selectedCourse.course_title}</h2>
                                        <div className="simple-section">
                                            <strong>Description:</strong>
                                            <div>{selectedCourse.description}</div>
                                        </div>
                                        <div className="simple-section">
                                            <strong>Prerequisites:</strong>
                                            <div>{selectedCourse.prerequisites && selectedCourse.prerequisites !== "null" ? selectedCourse.prerequisites : "None"}</div>
                                        </div>
                                        {courseDetails && courseDetails.professorDetails && courseDetails.professorDetails.length > 0 && (
                                            <div className="simple-section">
                                                <strong>Professors:</strong>
                                                <ul className="simple-prof-list">
                                                    {courseDetails.professorDetails.map(professor => (
                                                        <li key={professor._id}>
                                                            {professor.name} (Rating: {professor.overall_quality || 'N/A'}, Would Take Again: {professor.would_take_again ? `${professor.would_take_again}%` : 'N/A'}, Difficulty: {professor.difficulty || 'N/A'})
                                                            {professor.rmp_link && (
                                                                <a href={professor.rmp_link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: '#0066cc' }}>
                                                                    RMP
                                                                </a>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 