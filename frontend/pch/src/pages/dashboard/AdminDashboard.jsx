import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';

const AdminDashboard = () => {
  const { user, loading, hasRole } = useAuth();
  const isVet = hasRole('VET');

  const adminMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    ...(isVet ? [
      { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/appointments' },
      { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/patients' },
    ] : []),
    { name: 'Manage Staff', icon: PeopleAltOutlinedIcon, path: '/dashboard/manage-staff' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (loading) return <div className="loading-state">Loading Admin Dashboard...</div>;

  return (
    <DashboardLayout menuItems={adminMenu}>
      <div className="dashboard-header-banner">
        <h2>Admin Overview</h2>
        <p>Manage clinic staff, vets, and system settings.</p>
      </div>


    </DashboardLayout>
  );
};

export default AdminDashboard;