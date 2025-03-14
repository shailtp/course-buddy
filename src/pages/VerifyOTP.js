import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './VerifyOTP.css';

export default function VerifyOTP() {
    const [form, setForm] = useState({ email: '', otp: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/verify-otp', form);
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000); // Redirect after 2 sec
        } catch (err) {
            setError(err.response?.data?.message || "Error verifying OTP.");
        }
    };

    return (
        <div className="verify-otp-container">
            <h2>Verify Your Account</h2>
            <form onSubmit={handleVerify}>
                <input type="email" placeholder="Enter your SFSU Email" required onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="text" placeholder="Enter OTP" required onChange={e => setForm({ ...form, otp: e.target.value })} />
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
                <button type="submit">Verify OTP</button>
            </form>
        </div>
    );
}
