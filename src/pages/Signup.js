import { useState } from 'react';
import axios from 'axios';
import './Signup.css';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const validateEmail = (email) => email.endsWith('@sfsu.edu');

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(form.email)) {
            setError("Email must be a valid @sfsu.edu address");
            return;
        }

        if (!validatePassword(form.password)) {
            setError("Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 special character, and 1 number.");
            return;
        }

        try {
            const res = await axios.post('/api/auth/signup', form);
            alert(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Try again.");
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" required onChange={e => setForm({ ...form, name: e.target.value })} />
                <input type="email" placeholder="SFSU Email" required onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="password" placeholder="Password" required onChange={e => setForm({ ...form, password: e.target.value })} />
                {error && <p className="error">{error}</p>}
                <button type="submit">Signup</button>
            </form>
            <p className="login-link">Already have an account? <a href="/login">Login</a></p>
        </div>
    );
}
