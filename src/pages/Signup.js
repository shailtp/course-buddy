import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

export default function Signup() {
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        personalEmail: '',
        password: '' 
    });
    const [error, setError] = useState('');
    const [showOTPVerification, setShowOTPVerification] = useState(false);
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => email.endsWith('@sfsu.edu');

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(form.email)) {
            setError("SFSU Email must be a valid @sfsu.edu address");
            return;
        }

        if (!validatePassword(form.password)) {
            setError("Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 special character, and 1 number.");
            return;
        }

        try {
            const res = await axios.post('/api/auth/signup', form);
            setShowOTPVerification(true);
            alert("OTP has been sent to your personal email address");
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Try again.");
        }
    };

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/verify-otp', {
                email: form.email,
                otp: otp
            });
            alert("Account verified successfully!");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        }
    };

    if (showOTPVerification) {
        return (
            <div className="signup-container">
                <h2>Verify Your Email</h2>
                <p>Please enter the OTP sent to your personal email address</p>
                <form onSubmit={handleOTPVerification}>
                    <input 
                        type="text" 
                        placeholder="Enter OTP" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required 
                    />
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Verify OTP</button>
                </form>
            </div>
        );
    }

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                />
                <input 
                    type="email" 
                    placeholder="SFSU Email" 
                    required 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                />
                <input 
                    type="email" 
                    placeholder="Personal Email" 
                    required 
                    onChange={e => setForm({ ...form, personalEmail: e.target.value })} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                />
                {error && <p className="error">{error}</p>}
                <button type="submit">Signup</button>
            </form>
            <p className="login-link">Already have an account? <a href="/login">Login</a></p>
        </div>
    );
}
