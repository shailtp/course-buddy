import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error sending OTP.");
        }
    };

    return (
        <form onSubmit={handleForgotPassword}>
            <input type="email" placeholder="Enter your SFSU Email" required onChange={e => setEmail(e.target.value)} />
            {message && <p>{message}</p>}
            <button type="submit">Send OTP</button>
        </form>
    );
}
