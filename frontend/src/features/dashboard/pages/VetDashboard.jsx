import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DoctorAllPets from '../../pet/components/doctor/DoctorAllPets';
import MyProfile from './profile/MyProfile';
import VetAppointments from '../../appointment/pages/VetAppointments';
import PetMedicalRecordPage from '../../medical/pages/PetMedicalRecordPage';
import ManageTimeSlots from '../../appointment/pages/ManageTimeSlots';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

const VetDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const vetMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'All Pets', icon: HealingOutlinedIcon, path: '/dashboard/vet-patients' },
    { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/vet-appointments' },
    { name: 'Time Slots', icon: AccessTimeOutlinedIcon, path: '/dashboard/manage-slots' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings', disabled: true }
  ];

  if (loading) return <div className="loading-state">Syncing Professional Data...</div>;

  return (
    <DashboardLayout menuItems={vetMenu}>
      <Routes>
        <Route index element={
          <div className="animate-fade-up">
            <div className="doc-home-greeting">
              <div>
                <h1>Welcome back, Dr. {user?.firstName || 'Vet'}!</h1>
                <p>Monitor your patient records, medical history, and upcoming clinic visits.</p>
              </div>
              <div className="doc-role-badge">
                <span className="doc-sidebar-role-icon">⚕️</span>
                VETERINARIAN
              </div>
            </div>

            <div className="doc-stats-grid">
              <div className="doc-stat-card" style={{ '--accent': 'var(--color-primary)' }}>
                <div className="doc-stat-icon">🐕</div>
                <div className="doc-stat-value">—</div>
                <div className="doc-stat-label">Total Patients</div>
                <div className="doc-stat-sub">Clinic active database</div>
              </div>

              <div className="doc-stat-card" style={{ '--accent': '#2dd4bf' }}>
                <div className="doc-stat-icon">📅</div>
                <div className="doc-stat-value">—</div>
                <div className="doc-stat-label">Daily Schedule</div>
                <div className="doc-stat-sub">Today's appointments</div>
              </div>

              <div className="doc-stat-card" style={{ '--accent': '#6366f1' }}>
                <div className="doc-stat-icon">🏥</div>
                <div className="doc-stat-value">—</div>
                <div className="doc-stat-label">Admissions</div>
                <div className="doc-stat-sub">Current inpatient cases</div>
              </div>
            </div>

            <div className="doc-quick-actions">
              <h3>Doctor Portals</h3>
              <div className="doc-action-cards">
                <div className="doc-action-card" onClick={() => navigate('/dashboard/vet-patients')}>
                  <div className="doc-action-icon">📋</div>
                  <div className="doc-action-label">Patient Database</div>
                  <div className="doc-action-arrow">→</div>
                </div>
                <div className="doc-action-card" onClick={() => navigate('/dashboard/vet-appointments')}>
                  <div className="doc-action-icon">🕒</div>
                  <div className="doc-action-label">My Schedule</div>
                  <div className="doc-action-arrow">→</div>
                </div>
                <div className="doc-action-card" onClick={() => navigate('/dashboard/profile')}>
                  <div className="doc-action-icon">👤</div>
                  <div className="doc-action-label">Clinic Profile</div>
                  <div className="doc-action-arrow">→</div>
                </div>
              </div>
            </div>
          </div>
        } />

        <Route path="vet-patients" element={<DoctorAllPets />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="vet-appointments" element={<VetAppointments />} />
        <Route path="manage-slots" element={<ManageTimeSlots />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default VetDashboard;