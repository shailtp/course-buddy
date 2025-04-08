import './axiosConfig';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;
