import './axiosConfig';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Professors from './pages/Professors';
import Courses from './pages/Courses';
import Recommendations from './pages/Recommendations';
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './pages/Chat';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/professors" 
                    element={
                        <ProtectedRoute>
                            <Professors />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/courses" 
                    element={
                        <ProtectedRoute>
                            <Courses />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/recommendations" 
                    element={
                        <ProtectedRoute>
                            <Recommendations />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/chat" 
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
