import { Link } from 'react-router-dom';
import './PagesCommon.css';

export default function Recommendations() {
    return (
        <div className="page-container">
            <Link to="/dashboard" className="back-to-dashboard">
                ← Back to Dashboard
            </Link>
            <h1>LLM powered Course Recommendations</h1>
            <p className="page-description">
                This page will provide personalized course recommendations for Fall'25 using advanced AI.
            </p>
            <div className="coming-soon">
                Coming Soon
            </div>
        </div>
    );
} 