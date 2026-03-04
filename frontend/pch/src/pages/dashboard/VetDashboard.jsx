import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';

const VetDashboard = () => {
  const { user, loading } = useAuth();

  const vetMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/appointments' },
    { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/patients' },
    { name: 'Prescriptions', icon: LocalHospitalOutlinedIcon, path: '/dashboard/prescriptions' },
    { name: 'Messages', icon: ChatOutlinedIcon, path: '/dashboard/messages' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (loading) return <div className="loading-state">Loading Vet Dashboard...</div>;

  return (
    <DashboardLayout menuItems={vetMenu}>
      <div className="dashboard-header-banner">
        <h2>Doctor Overview</h2>
        <p>View your upcoming appointments and patient health records.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Appointments Today</h3>
          <p>0 scheduled</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VetDashboard;