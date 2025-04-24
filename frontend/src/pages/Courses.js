import { Link } from 'react-router-dom';
import './PagesCommon.css';

export default function Courses() {
    return (
        <div className="page-container">
            <Link to="/dashboard" className="back-to-dashboard">
                ← Back to Dashboard
            </Link>
            <h1>Course Information</h1>
            <p className="page-description">
                This page will display information about Computer Science courses from the database.
            </p>
            <div className="coming-soon">
                Coming Soon
            </div>
        </div>
    );
} 