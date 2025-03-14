import { useState } from 'react';
import axios from 'axios';
import './ResetPassword.css';

export default function ResetPassword() {
    const [form, setForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            const res = await axios.post('/api/auth/reset-password', form);
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Error resetting password.");
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Reset Your Password</h2>
            <form onSubmit={handleReset}>
                <input type="email" placeholder="Enter your SFSU Email" required onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="text" placeholder="Enter OTP" required onChange={e => setForm({ ...form, otp: e.target.value })} />
                <input type="password" placeholder="Enter New Password" required onChange={e => setForm({ ...form, newPassword: e.target.value })} />
                <input type="password" placeholder="Re-enter New Password" required onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
}
