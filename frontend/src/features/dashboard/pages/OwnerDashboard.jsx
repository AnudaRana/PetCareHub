import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getPetsByOwner } from '../../../services/petService';
import { getUpcomingVaccinationsByOwner } from '../../../services/vaccinationApi';

// Import the actual page content components
import MyPets from '../../pet/components/owner/MyPets';
import MyProfile from './profile/MyProfile';
import DoctorChanneling from '../../appointment/pages/DoctorChanneling';
import MyAppointments from '../../appointment/pages/MyAppointments';
import PetMedicalRecordPage from '../../medical/pages/PetMedicalRecordPage';
import OwnerBillingPage from '../../billing/pages/OwnerBillingPage';
import OwnerInvoicePage from '../../billing/pages/OwnerInvoicePage';
import OwnerOrdersPage from '../../order/pages/OwnerOrdersPage';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    petCount: 0,
    upcomingCount: 0,
    totalCount: 0,
    vaccinationCount: 0,
    upcomingAppointments: [],
    loading: true
  });

  useEffect(() => {
    if (!user?.userId) return;

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));

        // Fetch Pets
        const petsResult = await getPetsByOwner(user.userId);
        const pets = Array.isArray(petsResult)
          ? petsResult
          : Array.isArray(petsResult?.data)
          ? petsResult.data
          : [];

        // Fetch Appointments
        const appointmentsRes = await axios.get(`/api/appointments/user/${user.userId}`);
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
        const vaccinationRecordsRes = await getUpcomingVaccinationsByOwner(user.userId);
        const vaccinationRecords = Array.isArray(vaccinationRecordsRes)
          ? vaccinationRecordsRes
          : Array.isArray(vaccinationRecordsRes?.data)
          ? vaccinationRecordsRes.data
          : [];

        const upcoming = appointments.filter(a => (a.status || '').toUpperCase() === 'UPCOMING');
        const upcomingAppointmentCount = upcoming.filter(
          a => (a.appointmentType || '').toLowerCase() !== 'vaccination'
        ).length;
        const upcomingVaccinationAppointments = upcoming.filter(
          a => (a.appointmentType || '').toLowerCase() === 'vaccination'
        ).length;

        setStats({
          petCount: pets.length,
          upcomingCount: upcomingAppointmentCount,
          totalCount: appointments.length,
          vaccinationCount: upcomingVaccinationAppointments + vaccinationRecords.length,
          upcomingAppointments: upcoming,
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
    { name: 'Billing', icon: ReceiptLongOutlinedIcon, path: '/dashboard/billing' },
    { name: 'Shop', icon: StoreIcon, path: '/store' },
    { name: 'My Orders', icon: ShoppingBagIcon, path: '/dashboard/orders' },
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
                <div className="doc-stat-value">{stats.loading ? '...' : stats.vaccinationCount}</div>
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
                <div className="doc-action-card" onClick={() => navigate('/dashboard/billing')}>
                  <div className="doc-action-icon">🧾</div>
                  <div className="doc-action-label">Billing</div>
                  <div className="doc-action-arrow">→</div>
                </div>
                <div className="doc-action-card" onClick={() => navigate('/store')}>
                  <div className="doc-action-icon">🛒</div>
                  <div className="doc-action-label">Pet Store</div>
                  <div className="doc-action-arrow">→</div>
                </div>
              </div>
            </div>

            {/* ── Upcoming Appointments Section ── */}
            <div className="owner-upcoming-section">
              <div className="owner-upcoming-header">
                <h3>Upcoming Appointments</h3>
                <button
                  className="owner-upcoming-view-all"
                  onClick={() => navigate('/dashboard/appointments')}
                >
                  View All →
                </button>
              </div>

              {stats.loading ? (
                <p className="owner-upcoming-empty">Loading appointments...</p>
              ) : stats.upcomingAppointments.length === 0 ? (
                <div className="owner-upcoming-empty-state">
                  <div className="owner-upcoming-empty-icon">📅</div>
                  <p>No upcoming appointments.</p>
                  <button
                    className="owner-upcoming-book-btn"
                    onClick={() => navigate('/dashboard/doctor-channeling')}
                  >
                    Book an Appointment
                  </button>
                </div>
              ) : (
                <div className="owner-upcoming-list">
                  {stats.upcomingAppointments.slice(0, 5).map((appt) => (
                    <div key={appt.id} className="owner-upcoming-card">
                      <div className="owner-upcoming-card__left">
                        <div className="owner-upcoming-card__pet">
                          🐾 {appt.petName || appt.pet?.name || 'Pet'}
                          <span className="owner-upcoming-card__species">
                            {appt.petSpecies || appt.pet?.species ? `(${appt.petSpecies || appt.pet?.species})` : ''}
                          </span>
                        </div>
                        <div className="owner-upcoming-card__type">{appt.appointmentType}</div>
                        <div className="owner-upcoming-card__doctor">Dr. {appt.doctor || 'TBA'}</div>
                      </div>
                      <div className="owner-upcoming-card__right">
                        <div className="owner-upcoming-card__date">📆 {appt.date}</div>
                        <div className="owner-upcoming-card__time">🕐 {appt.timeSlot}</div>
                        <span className="owner-upcoming-card__badge">Upcoming</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        } />


        {/* Nested Pages that will appear in the "children" area */}
        <Route path="profile" element={<MyProfile />} />
        <Route path="pets" element={<MyPets />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="doctor-channeling" element={<DoctorChanneling />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />
        <Route path="billing" element={<OwnerBillingPage />} />
        <Route path="billing/invoice/:orderId" element={<OwnerInvoicePage />} />
        <Route path="orders" element={<OwnerOrdersPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
