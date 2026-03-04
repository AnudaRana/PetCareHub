import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';

const AdminDashboard = () => {
  const { user, loading } = useAuth();

  const adminMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'Manage Staff', icon: PeopleAltOutlinedIcon, path: '/dashboard/manage-staff' },
    { name: 'System Analytics', icon: BarChartOutlinedIcon, path: '/dashboard/analytics' },
    { name: 'System Logs', icon: MonitorHeartOutlinedIcon, path: '/dashboard/logs' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (loading) return <div className="loading-state">Loading Admin Dashboard...</div>;

  return (
    <DashboardLayout menuItems={adminMenu}>
      <div className="dashboard-header-banner">
        <h2>Admin Overview</h2>
        <p>Manage clinic staff, vets, and system settings.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>System Status</h3>
          <p>All systems operational</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;