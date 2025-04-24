import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PagesCommon.css';
import './Recommendations.css';

const COURSE_NUMBERS = [
    "CSC 101", "CSC 110", "CSC 215", "CSC 220", "CSC 230", "CSC 256", "CSC 300",
    "CSC 309", "CSC 317", "CSC 340", "CSC 408", "CSC 411", "CSC 413", "CSC 415",
    "CSC 510", "CSC 520", "CSC 615", "CSC 620", "CSC 621", "CSC 641", "CSC 642",
    "CSC 645", "CSC 648", "CSC 651", "CSC 652", "CSC 656", "CSC 665", "CSC 667",
    "CSC 675", "CSC 680", "CSC 690"
];

export default function Recommendations() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [numCourses, setNumCourses] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
    const [regenerateCount, setRegenerateCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const MAX_REGENERATIONS = 3;

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const filteredCourses = COURSE_NUMBERS.filter(course => 
        course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCourseSelect = (course) => {
        if (selectedCourses.includes(course)) {
            setSelectedCourses(selectedCourses.filter(c => c !== course));
        } else {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    const getRecommendations = async () => {
        setLoading(true);
        setError(null);
        setRegenerateCount(0);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to get recommendations');
            }

            console.log('Sending request with:', {
                numCourses,
                takenCourses: selectedCourses
            });

            const response = await axios.post('http://localhost:5001/api/recommendations', {
                numCourses,
                takenCourses: selectedCourses
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response received:', response.data);

            if (response.data && response.data.length > 0) {
                const initialRecommendations = response.data.slice(0, numCourses);
                setRecommendations(initialRecommendations);
                setAllRecommendations(response.data);
                setCurrentRecommendationIndex(numCourses);
                setStep(3);
            } else {
                throw new Error('No recommendations received');
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
            setError(error.response?.data?.message || error.message || 'Failed to get recommendations');
            // Don't advance to step 3 if there's an error
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAnother = () => {
        if (regenerateCount >= MAX_REGENERATIONS) {
            setError("Maximum number of regenerations reached. No more recommendations available.");
            return;
        }

        if (currentRecommendationIndex >= allRecommendations.length) {
            setError("No more recommendations available.");
            return;
        }

        const newRecommendations = allRecommendations.slice(
            currentRecommendationIndex, 
            currentRecommendationIndex + numCourses
        );

        if (newRecommendations.length === 0) {
            setError("No more recommendations available.");
            return;
        }

        setRecommendations(newRecommendations);
        setCurrentRecommendationIndex(currentRecommendationIndex + numCourses);
        setRegenerateCount(regenerateCount + 1);
        setError(null);
    };

    const openRMPLink = (link) => {
        if (link) {
            window.open(link, '_blank');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="step-container">
                        <h2>How many courses would you like to take?</h2>
                        <div className="number-selector">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    className={`number-button ${numCourses === num ? 'selected' : ''}`}
                                    onClick={() => setNumCourses(num)}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button 
                            className="next-button"
                            onClick={() => setStep(2)}
                        >
                            Next
                        </button>
                    </div>
                );
            
            case 2:
                return (
                    <div className="step-container">
                        <h2>Select your completed courses</h2>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="courses-grid">
                            {filteredCourses.map(course => (
                                <button
                                    key={course}
                                    className={`course-button ${selectedCourses.includes(course) ? 'selected' : ''}`}
                                    onClick={() => handleCourseSelect(course)}
                                >
                                    {course}
                                </button>
                            ))}
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <div className="navigation-buttons">
                            <button 
                                className="back-button"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </button>
                            <button 
                                className="next-button"
                                onClick={getRecommendations}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Get Recommendations'}
                            </button>
                        </div>
                    </div>
                );
            
            case 3:
                return (
                    <div className="step-container">
                        <h2>Your Recommended Courses</h2>
                        {loading ? (
                            <div className="loading">
                                <div className="loading-spinner"></div>
                                <p>Generating recommendations...</p>
                            </div>
                        ) : error ? (
                            <div className="error-container">
                                <p className="error-message">{error}</p>
                                <button 
                                    className="retry-button"
                                    onClick={() => {
                                        setError(null);
                                        getRecommendations();
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="recommendations-container">
                                <div className="recommendations-list">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="recommendation-card">
                                            <h3>{rec.course_number} - {rec.course_title}</h3>
                                            <p className="description">{rec.description}</p>
                                            
                                            <div className="prerequisites-section">
                                                <h4>Prerequisites:</h4>
                                                <p>{rec.prerequisites}</p>
                                            </div>
                                            
                                            {rec.reason && (
                                                <div className="reason-section">
                                                    <h4>Why this course?</h4>
                                                    <p>{rec.reason}</p>
                                                </div>
                                            )}
                                            
                                            <div className="professor-info">
                                                <div className="professor-header">
                                                    <p><strong>Professor:</strong> {rec.professor}</p>
                                                    {rec.rmp_link && (
                                                        <button 
                                                            className="rmp-button"
                                                            onClick={() => openRMPLink(rec.rmp_link)}
                                                        >
                                                            View on RateMyProfessors
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="ratings-grid">
                                                    <p><strong>Overall Quality:</strong> {rec.overall_quality ? `${rec.overall_quality}/5` : 'N/A'}</p>
                                                    <p><strong>Would Take Again:</strong> {rec.would_take_again ? `${rec.would_take_again}%` : 'N/A'}</p>
                                                    <p><strong>Difficulty:</strong> {rec.difficulty ? `${rec.difficulty}/5` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="regenerate-info">
                                    <p>Regenerations used: {regenerateCount} of {MAX_REGENERATIONS}</p>
                                </div>
                                
                                <div className="navigation-buttons">
                                    <button 
                                        className="generate-another-button"
                                        onClick={handleGenerateAnother}
                                        disabled={regenerateCount >= MAX_REGENERATIONS || currentRecommendationIndex >= allRecommendations.length}
                                    >
                                        Generate Another Set
                                    </button>
                                    <button 
                                        className="back-button"
                                        onClick={() => setStep(2)}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="page-container">
            <Link to="/dashboard" className="back-to-dashboard">
                ← Back to Dashboard
            </Link>
            <h1>Course Recommendations</h1>
            <div className="recommendation-form">
                {renderStep()}
            </div>
        </div>
    );
} 