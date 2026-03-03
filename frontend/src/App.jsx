import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import StaffDashboard from './pages/StaffDashboard';

const RoleBasedRedirect = () => {
  // The login developer stores the full ROLE_XXX string from the JWT response
  // e.g. localStorage.getItem('role') === 'ROLE_VET'
  const role = localStorage.getItem('role');
  if (role === 'ROLE_VET') return <Navigate to="/doctor-dashboard" replace />;
  if (role === 'ROLE_OWNER') return <Navigate to="/dashboard" replace />;
  if (role === 'ROLE_STAFF') return <Navigate to="/staff-dashboard" replace />;
  if (role === 'ROLE_ADMIN') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const App = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      {/* /login is handled by the login developer's separate page/app */}
      {/* We still need this route so Navigate to="/login" doesn't 404 */}
      <Route path="/login" element={<RoleBasedRedirect />} />
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="*" element={<RoleBasedRedirect />} />
    </Routes>
  </Router>
);

export default App;