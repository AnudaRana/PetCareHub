import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
/**
 * Route guard: reads role from sessionStorage and sends to correct dashboard.
 */
const RoleBasedRedirect = () => {
  const role = sessionStorage.getItem('role');
  if (role === 'VET') return <Navigate to="/doctor-dashboard" replace />;
  if (role === 'OWNER') return <Navigate to="/dashboard" replace />;
  // No role set — go to login
  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<div>Redirecting to external login...</div>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        {/* Default: role-based redirect */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
};

export default App;
