import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getPetsByOwner } from '../../../services/petService';

// Import the actual page content components
import MyPets from '../../pet/components/owner/MyPets';
import MyProfile from './profile/MyProfile';
import DoctorChanneling from '../../appointment/pages/DoctorChanneling';
import MyAppointments from '../../appointment/pages/MyAppointments';
import PetMedicalRecordPage from '../../medical/pages/PetMedicalRecordPage';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined';
import StoreIcon from '@mui/icons-material/Store';
import HistoryIcon from '@mui/icons-material/History';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    petCount: 0,
    upcomingCount: 0,
    totalCount: 0,
    loading: true
  });

  useEffect(() => {
    if (!user?.userId) return;

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));

        // Fetch Pets
        const petsRes = await getPetsByOwner(user.userId);
        const pets = Array.isArray(petsRes.data) ? petsRes.data : (Array.isArray(petsRes) ? petsRes : []);

        // Fetch Appointments
        const appointmentsRes = await axios.get(`/api/appointments/user/${user.userId}`);
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];

        const upcoming = appointments.filter(a => (a.status || '').toUpperCase() === 'UPCOMING');

        setStats({
          petCount: pets.length,
          upcomingCount: upcoming.length,
          totalCount: appointments.length,
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user?.userId]);

  const ownerMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'My Pets', icon: PetsOutlinedIcon, path: '/dashboard/pets' },
    { name: 'My Appointments', icon: CalendarTodayIcon, path: '/dashboard/appointments' },
    { name: 'Doctor Channeling', icon: BookOnlineOutlinedIcon, path: '/dashboard/doctor-channeling' },
    { name: 'Shop', icon: StoreIcon, path: '/store' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings', disabled: true }
  ];

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout menuItems={ownerMenu}>
      <Routes>

        {/* The default dashboard view (Home) */}
        <Route index element={
          <div className="animate-fade-up">
            <div className="doc-home-greeting">
              <div>
                <h1>Welcome back, {user?.firstName || user?.email}!</h1>
                <p>Manage your furry friends, track health records and upcoming clinic visits.</p>
              </div>
              <div className="doc-role-badge">
                <span className="doc-sidebar-role-icon">👤</span>
                PET OWNER
              </div>
            </div>

            <div className="doc-stats-grid">
              <div className="doc-stat-card" style={{ '--accent': 'var(--color-primary)' }}>
                <div className="doc-stat-icon">🐕</div>
                <div className="doc-stat-value">{stats.loading ? '...' : stats.petCount}</div>
                <div className="doc-stat-label">Registered Pets</div>
                <div className="doc-stat-sub">Active profiles</div>
              </div>

              <div className="doc-stat-card" style={{ '--accent': '#2dd4bf' }}>
                <div className="doc-stat-icon">📅</div>
                <div className="doc-stat-value">{stats.loading ? '...' : stats.upcomingCount}</div>
                <div className="doc-stat-label">Upcoming</div>
                <div className="doc-stat-sub">Next appointments</div>
              </div>

              <div className="doc-stat-card" style={{ '--accent': '#6366f1' }}>
                <div className="doc-stat-icon">📜</div>
                <div className="doc-stat-value">{stats.loading ? '...' : stats.totalCount}</div>
                <div className="doc-stat-label">Total Visits</div>
                <div className="doc-stat-sub">Lifetime history</div>
              </div>

              <div className="doc-stat-card" style={{ '--accent': '#f59e0b' }}>
                <div className="doc-stat-icon">💊</div>
                <div className="doc-stat-value">0</div>
                <div className="doc-stat-label">Vaccinations</div>
                <div className="doc-stat-sub">Due in 30 days</div>
              </div>
            </div>

            <div className="doc-quick-actions">
              <h3>Direct Access</h3>
              <div className="doc-action-cards">
                <div className="doc-action-card" onClick={() => navigate('/dashboard/pets')}>
                  <div className="doc-action-icon">🐾</div>
                  <div className="doc-action-label">My Pets</div>
                  <div className="doc-action-arrow">→</div>
                </div>
                <div className="doc-action-card" onClick={() => navigate('/dashboard/doctor-channeling')}>
                  <div className="doc-action-icon">🏥</div>
                  <div className="doc-action-label">Book Vet</div>
                  <div className="doc-action-arrow">→</div>
                </div>
                <div className="doc-action-card" onClick={() => navigate('/store')}>
                  <div className="doc-action-icon">🛒</div>
                  <div className="doc-action-label">Pet Store</div>
                  <div className="doc-action-arrow">→</div>
                </div>
                <div className="doc-action-card" onClick={() => navigate('/dashboard/profile')}>
                  <div className="doc-action-icon">⚙️</div>
                  <div className="doc-action-label">Settings</div>
                  <div className="doc-action-arrow">→</div>
                </div>
              </div>
            </div>
          </div>
        } />


        {/* Nested Pages that will appear in the "children" area */}
        <Route path="profile" element={<MyProfile />} />
        <Route path="pets" element={<MyPets />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="doctor-channeling" element={<DoctorChanneling />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OwnerDashboard;