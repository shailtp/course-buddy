import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [user, setUser] = useState({
        name: "Shail Patel",
        email: "patelshail233@gmail.com",
        sfsuEmail: "spatel37@sfsu.edu"
    });
    const navigate = useNavigate();

    // Fetch user data when component mounts (you'll need to implement an API endpoint for this)
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Commented out until backend API endpoint is implemented
                // const token = localStorage.getItem('token');
                // const res = await axios.get('/api/auth/me', {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                // setUser(res.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        fetchUserData();
    }, []);

    const toggleUserModal = () => {
        setShowUserModal(!showUserModal);
        // Close logout confirm if it's open
        if (showLogoutConfirm) {
            setShowLogoutConfirm(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="dashboard-container">
            {/* User Icon with Modal */}
            <div className="user-profile">
                <button onClick={toggleUserModal} className="user-icon-button">
                    <i className="user-icon">👤</i>
                </button>
                
                {showUserModal && (
                    <div className="user-modal">
                        <div className="user-info">
                            <h3>{user.name}</h3>
                            <p>Personal: {user.email}</p>
                            <p>SFSU: {user.sfsuEmail}</p>
                        </div>
                        <button onClick={handleLogoutClick} className="modal-logout-button">Logout</button>
                    </div>
                )}

                {showLogoutConfirm && (
                    <div className="logout-confirmation">
                        <div className="logout-modal">
                            <p>Are you sure you want to logout?</p>
                            <div className="logout-actions">
                                <button onClick={handleLogoutCancel} className="cancel-button">No</button>
                                <button onClick={handleLogoutConfirm} className="confirm-button">Yes</button>
                            </div>
                        </div>
                        <div className="logout-overlay" onClick={handleLogoutCancel}></div>
                    </div>
                )}
            </div>
            
            <header className="dashboard-header">
                <h1 className="main-title">Course Buddy <span className="wave-emoji">👋</span></h1>
                <p className="subtitle">One stop solution for registering Computer Science Classes at San Francisco State!</p>
            </header>

            <div className="tiles-container">
                <Link to="/professors" className="tile">
                    <div className="tile-content">
                        <h2>Professor Information</h2>
                        <p>Browse and find details about CS professors</p>
                    </div>
                </Link>

                <Link to="/courses" className="tile">
                    <div className="tile-content">
                        <h2>Course Information</h2>
                        <p>Explore Computer Science courses and prerequisites</p>
                    </div>
                </Link>

                <Link to="/recommendations" className="tile">
                    <div className="tile-content">
                        <h2>LLM powered Course Recommendations for Fall'25</h2>
                        <p>Get personalized course suggestions</p>
                    </div>
                </Link>

                <Link to="/chat" className="tile">
                    <div className="tile-content">
                        <h2>Course Buddy GPT</h2>
                        <p>Personal course selection chatbot</p>
                    </div>
                </Link>
            </div>
        </div>
    );
} 