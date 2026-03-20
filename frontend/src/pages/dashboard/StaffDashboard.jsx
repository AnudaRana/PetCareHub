import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const StaffDashboard = () => {
  const { user, loading } = useAuth();

  const staffMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'Manage Appointments', icon: ContentPasteSearchOutlinedIcon, path: '/dashboard/appointments' },
    { name: 'Store Management', icon: StoreOutlinedIcon, path: '/dashboard/store' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (loading) return <div className="loading-state">Loading Staff Dashboard...</div>;

  return (
    <DashboardLayout menuItems={staffMenu}>
      <div className="dashboard-header-banner">
        <h2>Staff Overview</h2>
        <p>Manage clinic schedule, front desk operations, and shop inventory.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Appointments</h3>
          <p>0 to review</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;