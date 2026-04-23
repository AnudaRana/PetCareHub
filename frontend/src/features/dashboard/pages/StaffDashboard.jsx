import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { API_BASE_URL } from '../../../services/petService';

import StaffAllPets from '../../pet/components/staff/StaffAllPets';
import StaffAllAppointments from '../../appointment/pages/StaffAllAppointments';
import MyProfile from './profile/MyProfile';
import PetMedicalRecordPage from '../../medical/pages/PetMedicalRecordPage';
import StaffReceiptsPage from '../../receipts/pages/StaffReceiptsPage';
import InvoiceDetailsPage from '../../receipts/pages/InvoiceDetailsPage';
import ManageOrdersPage from '../../order/pages/ManageOrdersPage';
import ManageShopPage from '../../store/pages/ManageShopPage';
import FeedbackManagement from '../../feedback/pages/FeedbackManagement';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';

import '../components/Dashboard.css';

const StaffDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchClinicalStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        const response = await axios.get(`${API_BASE_URL}/api/appointments`);
        const data = response.data?.data || response.data || [];
        const appointments = Array.isArray(data) ? data : [];
        const upcoming = appointments.filter(a => (a.status || '').toUpperCase() === 'UPCOMING');
        setStats({
          upcomingCount: upcoming.length,
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch staff stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchClinicalStats();
  }, []);

  const staffMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'All Pets', icon: HealingOutlinedIcon, path: '/dashboard/staff-patients' },
    { name: 'Manage Appointments', icon: ContentPasteSearchOutlinedIcon, path: '/dashboard/staff-appointments' },
    { name: 'Receipts', icon: ReceiptLongOutlinedIcon, path: '/dashboard/receipts' },
    { name: 'Manage Shop', icon: StoreOutlinedIcon, path: '/dashboard/manage-shop'},
    { name: 'Manage Orders', icon: ShoppingBagIcon, path: '/dashboard/manage-orders'},
    { name: 'Feedback Management', icon: FeedbackOutlinedIcon, path: '/dashboard/feedbacks' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings', disabled: true }
  ];

  if (authLoading) return <div className="loading-state">Syncing Operational Hub...</div>;

  return (
    <DashboardLayout menuItems={staffMenu}>
      <Routes>
        <Route index element={
          <div className="animate-fade-up">
            <div className="staff-home-greeting">
              <div>
                <h1>Welcome back, {user?.firstName || 'Staff'}!</h1>
                <p>Manage clinic schedule, patient intakes, and shop operations.</p>
              </div>
              <div className="staff-role-badge">
                <span className="doc-sidebar-role-icon">📋</span>
                CLINIC STAFF
              </div>
            </div>

            <div className="staff-stats-grid">
              <div className="staff-stat-card" style={{ '--accent': '#2dd4bf' }}>
                <div className="staff-stat-icon">📅</div>
                <div className="staff-stat-value">{stats.loading ? '...' : stats.upcomingCount}</div>
                <div className="staff-stat-label">Upcoming</div>
                <div className="staff-stat-sub">Clinical sessions</div>
              </div>

              <div className="staff-stat-card" style={{ '--accent': '#f59e0b' }}>
                <div className="staff-stat-icon">🛒</div>
                <div className="staff-stat-value">—</div>
                <div className="staff-stat-label">Stock Alerts</div>
                <div className="staff-stat-sub">Items below threshold</div>
              </div>

              <div className="staff-stat-card" style={{ '--accent': '#6366f1' }}>
                <div className="staff-stat-icon">🔔</div>
                <div className="staff-stat-value">—</div>
                <div className="staff-stat-label">Notifications</div>
                <div className="staff-stat-sub">System updates</div>
              </div>
            </div>

            <div className="staff-quick-actions">
              <h3>Operational Portals</h3>
              <div className="staff-action-cards">
                <div className="staff-action-card" onClick={() => navigate('/dashboard/staff-patients')}>
                  <div className="staff-action-icon">📋</div>
                  <div className="staff-action-label">Patient Intake</div>
                  <div className="staff-action-arrow">→</div>
                </div>
                <div className="staff-action-card" onClick={() => navigate('/dashboard/staff-appointments')}>
                  <div className="staff-action-icon">📅</div>
                  <div className="staff-action-label">Clinic Schedule</div>
                  <div className="staff-action-arrow">→</div>
                </div>
                <div className="staff-action-card" onClick={() => navigate('/dashboard/receipts')}>
                  <div className="staff-action-icon">🧾</div>
                  <div className="staff-action-label">Receipts & Invoices</div>
                  <div className="staff-action-arrow">→</div>
                </div>
                <div className="staff-action-card" onClick={() => navigate('/dashboard/manage-shop')}>
                  <div className="staff-action-icon">🏬</div>
                  <div className="staff-action-label">Shop Inventory</div>
                  <div className="staff-action-arrow">→</div>
                </div>
                <div className="staff-action-card" onClick={() => navigate('/dashboard/feedbacks')}>
                  <div className="staff-action-icon">⭐</div>
                  <div className="staff-action-label">Feedback Center</div>
                  <div className="staff-action-arrow">→</div>
                </div>
              </div>
            </div>
          </div>
        } />

        <Route path="staff-patients" element={<StaffAllPets />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="staff-appointments" element={<StaffAllAppointments />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />
        <Route path="receipts" element={<StaffReceiptsPage />} />
        <Route path="receipts/:invoiceId" element={<InvoiceDetailsPage />} />
        <Route path="manage-orders" element={<ManageOrdersPage />} />
        <Route path="manage-shop" element={<ManageShopPage />} />
        <Route path="feedbacks" element={<FeedbackManagement />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StaffDashboard;
