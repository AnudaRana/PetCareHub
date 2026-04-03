import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DoctorAllPets from '../../pet/components/doctor/DoctorAllPets'; // Path to your All Pets component
import MyProfile from './profile/MyProfile';
import VetAppointments from '../../appointment/pages/VetAppointments';
import PetMedicalRecordPage from '../../medical/pages/PetMedicalRecordPage';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const VetDashboard = () => {
  const { user, loading } = useAuth();

  const vetMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/vet-patients' },
    { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/vet-appointments' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (loading) return <div className="loading-state">Loading Vet Dashboard...</div>;

  return (
    <DashboardLayout menuItems={vetMenu}>
      <Routes>
        {/* --- MAIN VET HOME VIEW --- */}
        <Route index element={
          <>
            <div className="dashboard-header-banner">
              <h2>Welcome back, {user?.firstName || 'Doctor'}!</h2>
              <p>View your upcoming appointments and patient health records.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Appointments Today</h3>
                <p>0 scheduled</p>
              </div>
              <div className="stat-card">
                <h3>Total Patients</h3>
                <p>View in Patient Records</p>
              </div>
            </div>
          </>
        } />

        {/* --- NESTED ROUTES --- */}
        {/* This renders the All Pets searchable table inside the dashboard */}
        <Route path="vet-patients" element={<DoctorAllPets />} />
        
        <Route path="profile" element={<MyProfile />} />
        
        {/* Placeholder for Appointments */}
        <Route path="vet-appointments" element={<VetAppointments />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />

        {/* Catch-all to redirect back to main dashboard if path is wrong */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default VetDashboard;