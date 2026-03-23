 import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import StaffDashboard from './pages/StaffDashboard';
import MyAppointments from './pages/MyAppointments';
import DoctorChanneling from './pages/DoctorChanneling';
import MyPetsPage from './pages/MyPets';

const RoleBasedRedirect = () => {
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

      <Route path="/my-pets" element={<MyPetsPage />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/doctor-channeling" element={<DoctorChanneling />} />

      <Route path="/login" element={<RoleBasedRedirect />} />
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="*" element={<RoleBasedRedirect />} />
    </Routes>
  </Router>
);

export default App;