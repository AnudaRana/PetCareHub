import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getAllPets } from '../../../services/petService';
import '../components/Dashboard.css';

import DoctorAllPets from '../../pet/components/doctor/DoctorAllPets';
import MyProfile from './profile/MyProfile';
import ManageStaff from './manageStaff/ManageStaff';
import VetAppointments from '../../appointment/pages/VetAppointments';
import ManageOrdersPage from '../../order/pages/ManageOrdersPage';
import ManageShopPage from '../../store/pages/ManageShopPage';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const AdminDashboard = () => {
  const { user, loading: authLoading, token, hasRole } = useAuth();
  const isVet = hasRole('VET');

  const [stats, setStats] = useState({
    vets: 0,
    staff: 0,
    appointmentsToday: 0,
    totalPatients: 0,
    loading: true
  });

  useEffect(() => {
    if (!token) return;

    const fetchAdminStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));

        // 1. Fetch Users to count Vets and Staff
        const usersRes = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
        const vetCount = allUsers.filter(u => u.roles.includes('ROLE_VET')).length;
        const staffCount = allUsers.filter(u => u.roles.includes('ROLE_STAFF')).length;

        let apptsToday = 0;
        let patients = 0;

        // 2. If Admin is also a Vet, fetch Vet-specific stats
        if (isVet && user?.userId) {
          const petsRes = await getAllPets();
          patients = Array.isArray(petsRes.data) ? petsRes.data.length : (Array.isArray(petsRes) ? petsRes.length : 0);

          const appointmentsRes = await axios.get(`/api/appointments/vet/${user.userId}`);
          const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
          const today = new Date().toISOString().split('T')[0];
          apptsToday = appointments.filter(a => a.date === today && a.status !== 'CANCELLED').length;
        }

        setStats({
          vets: vetCount,
          staff: staffCount,
          appointmentsToday: apptsToday,
          totalPatients: patients,
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAdminStats();
  }, [token, isVet, user?.userId]);

  // Define the menu ONCE here
  const adminMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    ...(isVet ? [
      { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/patients' },
      { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/vet-appointments' },
    ] : [
      { name: 'Manage Shop', icon: StoreOutlinedIcon, path: '/dashboard/manage-shop' },
      { name: 'Manage Orders', icon: ShoppingBagIcon, path: '/dashboard/manage-orders' }
    ]),
    { name: 'Manage Staff', icon: PeopleAltOutlinedIcon, path: '/dashboard/manage-staff' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (authLoading) return <div className="loading-state">Loading Admin Dashboard...</div>;

  return (
    <DashboardLayout menuItems={adminMenu}>
      <Routes>
        <Route index element={
          <>
            <div className="dashboard-header-banner">
              <h2>Welcome back, {user?.firstName || 'Admin'}!</h2>
              <p>Manage clinic staff, vets, and system settings.</p>
            </div>

            <div className="dashboard-stats-grid">
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>Registered Veterinarians</h3>
                    <p>{stats.loading ? '...' : `${stats.vets} professionals`}</p>
                  </div>
                  <AssignmentIndOutlinedIcon style={{ color: '#6366f1', opacity: 0.8, fontSize: '32px' }} />
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>Total Clinic Staff</h3>
                    <p>{stats.loading ? '...' : `${stats.staff} members`}</p>
                  </div>
                  <BadgeOutlinedIcon style={{ color: '#f59e0b', opacity: 0.8, fontSize: '32px' }} />
                </div>
              </div>

              {/* Conditional Vet-Admin Stats */}
              {isVet && (
                <>
                  <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3>Appointments Today</h3>
                        <p>{stats.loading ? '...' : `${stats.appointmentsToday} scheduled`}</p>
                      </div>
                      <EventAvailableIcon style={{ color: '#2dd4bf', opacity: 0.8, fontSize: '32px' }} />
                    </div>
                  </div>

                  <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3>Total Patient Records</h3>
                        <p>{stats.loading ? '...' : `${stats.totalPatients} in system`}</p>
                      </div>
                      <GroupsIcon style={{ color: 'var(--color-primary)', opacity: 0.8, fontSize: '32px' }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        } />

        {/* Nested Admin Pages */}
        <Route path="manage-staff" element={<ManageStaff />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="patients" element={<DoctorAllPets />} />
        <Route path="vet-appointments" element={<VetAppointments />} />
        <Route path="manage-orders" element={<ManageOrdersPage />} />
        <Route path="manage-shop" element={<ManageShopPage />} />
        
        {/* Catch-all to redirect back to main dashboard if path is wrong */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;