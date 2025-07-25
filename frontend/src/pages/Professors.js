import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PagesCommon.css';
import './Professors.css';

export default function Professors() {
    const [professors, setProfessors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfessor, setSelectedProfessor] = useState(null);

    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                setLoading(true);
                console.log('Fetching professors from API...');
                const response = await axios.get('http://localhost:5001/api/professors');
                console.log('API Response:', response.data);
                
                // Sort professors by name
                const sortedProfessors = response.data.sort((a, b) => 
                    a.name.localeCompare(b.name)
                );
                
                setProfessors(sortedProfessors);
                setError(null);
            } catch (err) {
                console.error('Error fetching professors:', err);
                setError('Failed to load professors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfessors();
    }, []);

    const handleProfessorClick = (professor) => {
        setSelectedProfessor(professor);
    };

    const filteredProfessors = professors.filter(professor => 
        professor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating) => {
        if (!rating) return 'No rating available';
        
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return (
            <div className="star-rating">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="star full">★</span>
                ))}
                {halfStar && <span className="star half">★</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="star empty">☆</span>
                ))}
                <span className="rating-number"> ({rating.toFixed(1)})</span>
            </div>
        );
    };

    return (
        <div className="page-container">
            <Link to="/dashboard" className="back-to-dashboard">
                ← Back to Dashboard
            </Link>
            <h1>Professor Information</h1>
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading professors...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            ) : (
                <div className="professors-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search professors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="professors-grid">
                        <div className="professors-list">
                            {filteredProfessors.length > 0 ? (
                                filteredProfessors.map(professor => (
                                    <div
                                        key={professor._id}
                                        className={`professor-item ${selectedProfessor && selectedProfessor._id === professor._id ? 'selected' : ''}`}
                                        onClick={() => handleProfessorClick(professor)}
                                    >
                                        {professor.name}
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">No professors found matching "{searchTerm}"</div>
                            )}
                        </div>
                        
                        {selectedProfessor && (
                            <div className="professor-details">
                                <h2>{selectedProfessor.name}</h2>
                                
                                <div className="rating-section">
                                    <div className="rating-item">
                                        <h3>Overall Quality</h3>
                                        {renderStars(selectedProfessor.overall_quality)}
                                    </div>
                                    
                                    <div className="rating-item">
                                        <h3>Would Take Again</h3>
                                        <div className="percentage-bar">
                                            <div 
                                                className="percentage-fill" 
                                                style={{ width: `${selectedProfessor.would_take_again || 0}%` }}
                                            ></div>
                                            <span>{selectedProfessor.would_take_again ? `${selectedProfessor.would_take_again}%` : 'N/A'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="rating-item">
                                        <h3>Difficulty</h3>
                                        {renderStars(selectedProfessor.difficulty)}
                                    </div>
                                </div>
                                
                                {selectedProfessor.courses_offered && selectedProfessor.courses_offered.length > 0 && (
                                    <div className="courses-section">
                                        <h3>Courses Taught</h3>
                                        <div className="courses-list">
                                            {selectedProfessor.courses_offered.map(course => (
                                                <div key={course} className="course-chip">
                                                    {course}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedProfessor.rmp_link && (
                                    <div className="rmp-link">
                                        <a 
                                            href={selectedProfessor.rmp_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="rmp-button"
                                        >
                                            View on RateMyProfessors
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
            </div>
            )}
        </div>
    );
} 