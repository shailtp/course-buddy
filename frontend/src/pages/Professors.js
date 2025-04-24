import { Link } from 'react-router-dom';
import './PagesCommon.css';

export default function Professors() {
    return (
        <div className="page-container">
            <Link to="/dashboard" className="back-to-dashboard">
                ← Back to Dashboard
            </Link>
            <h1>Professor Information</h1>
            <p className="page-description">
                This page will display information about professors from the database.
            </p>
            <div className="coming-soon">
                Coming Soon
            </div>
        </div>
    );
} 