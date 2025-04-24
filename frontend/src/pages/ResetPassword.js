import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

export default function ResetPassword() {
    const [step, setStep] = useState(1); // Step 1: Email verification, Step 2: OTP & new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2); // Move to OTP and password reset step
        } catch (err) {
            if (err.response?.data?.message === "User not found") {
                setError("User not found. Please signup.");
            } else {
                setError(err.response?.data?.message || "Error sending OTP.");
            }
        }
    };

    // Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            const res = await axios.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000); // Redirect to login after success
        } catch (err) {
            setError(err.response?.data?.message || "Error resetting password.");
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Reset Your Password</h2>
            
            {/* Step 1: Email Verification */}
            {step === 1 && (
                <form onSubmit={handleRequestOTP}>
                    <input 
                        type="email" 
                        placeholder="Enter your SFSU Email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                    
                    {error && error.includes("User not found") ? (
                        <div className="error-container">
                            <p className="error">{error}</p>
                            <Link to="/signup" className="signup-link">Signup</Link>
                        </div>
                    ) : (
                        <p className="error">{error}</p>
                    )}
                    
                    {message && <p className="success">{message}</p>}
                    <button type="submit" className="get-otp-btn">Get OTP</button>
                </form>
            )}
            
            {/* Step 2: OTP Verification and Password Reset */}
            {step === 2 && (
                <form onSubmit={handleResetPassword}>
                    <p className="email-display">Email: {email}</p>
                    <input 
                        type="text" 
                        placeholder="Enter OTP" 
                        value={otp}
                        onChange={e => setOtp(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Enter New Password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Re-enter New Password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)} 
                        required 
                    />
                    
                    {error && <p className="error">{error}</p>}
                    {message && <p className="success">{message}</p>}
                    
                    <div className="button-group">
                        <button type="button" onClick={() => setStep(1)} className="back-btn">Back</button>
                        <button type="submit" className="reset-btn">Reset Password</button>
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={handleRequestOTP} 
                        className="resend-otp-btn"
                    >
                        Resend OTP
                    </button>
                </form>
            )}
        </div>
    );
}
