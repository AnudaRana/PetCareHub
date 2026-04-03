import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/contexts/AuthContext';
import Home from './features/home/Home';
import Login from './features/auth/pages/Login';
import SignUp from './features/auth/pages/SignUp';
import ForgotPasswordEmail from './features/auth/pages/ForgotPasswordEmail';
import ForgotPasswordOtp from './features/auth/pages/ForgotPasswordOtp';
import ResetPassword from './features/auth/pages/ResetPassword';
import RoleDashboard from './features/dashboard/pages/RoleDashboard';


const Protected = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading…</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
      <Route path="/verify-otp" element={<ForgotPasswordOtp />} />
      <Route path="/reset" element={<ResetPassword />} />

      <Route
        path="/dashboard/*"
        element={
          <Protected>
            <RoleDashboard />
          </Protected>
        }
      />
      

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;
