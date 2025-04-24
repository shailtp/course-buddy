import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', form);
            localStorage.setItem('token', res.data.token);
            alert("Login Successful!");
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid login credentials.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Enter your SFSU Email" required onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="password" placeholder="Enter Password" required onChange={e => setForm({ ...form, password: e.target.value })} />
                {error && <p className="error">{error}</p>}
                <button type="submit">Login</button>
            </form>
            <div className="extra-links">
                <Link to="/reset-password">Forgot Password?<br></br></Link>
                <Link to="/signup">Don't have an account? Signup</Link>
            </div>
        </div>
    );
}
