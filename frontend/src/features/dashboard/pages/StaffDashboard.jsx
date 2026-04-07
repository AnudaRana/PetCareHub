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
import ManageOrders from '../../order/pages/ManageOrders';
import OrderDetails from '../../order/pages/OrderDetails';
import { getPendingOrders } from '../../../services/orderService';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import '../components/Dashboard.css';

const StaffDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingCount: 0,
    loading: true
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

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

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await getPendingOrders();
        setPendingOrders((res.data || []).slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch pending orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchClinicalStats();
    fetchOrders();
  }, []);

  const staffMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/staff-patients' },
    { name: 'Manage Appointments', icon: ContentPasteSearchOutlinedIcon, path: '/dashboard/staff-appointments' },
    { name: 'Store Management', icon: StoreOutlinedIcon, path: '/dashboard/store' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (authLoading) return <div className="loading-state">Loading Staff Dashboard...</div>;

  return (
    <DashboardLayout menuItems={staffMenu}>
      <Routes>

        <Route index element={
          <>
            <div className="dashboard-header-banner">
              <h2>Welcome back, {user?.firstName}!</h2>
              <p>Manage clinic schedule and shop inventory.</p>
            </div>

            <div className="dashboard-stats-grid">
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>Upcoming Appointments</h3>
                    <p>{stats.loading ? '...' : `${stats.upcomingCount} clinical sessions`}</p>
                  </div>
                  <EventNoteIcon style={{ color: '#2dd4bf', opacity: 0.8, fontSize: '32px' }} />
                </div>
              </div>

              <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3>Current Orders</h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-light)', fontWeight: 500 }}>Oldest pending orders</p>
                  </div>
                  <button 
                    className="btn btn-dark-blue"
                    onClick={() => navigate('/dashboard/manage-orders')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 16px', fontSize: '0.85rem'
                    }}>
                    <ManageAccountsIcon fontSize="small" /> Manage Orders
                  </button>
                </div>
                <div className="order-history-content">
                  {ordersLoading ? (
                    <p style={{ margin: 0 }}>Loading orders...</p>
                  ) : pendingOrders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pendingOrders.map(order => (
                        <div key={order.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.9rem' }}>{order.orderNumber} - {order.ownerFullName}</p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              <span style={{ 
                                fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                                backgroundColor: '#fef3c7', color: '#d97706'
                              }}>
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                          <button 
                            className="btn btn-dark-blue"
                            onClick={() => navigate(`/dashboard/order-details/${order.orderId}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              padding: '4px 12px', fontSize: '0.8rem'
                            }}>
                            <VisibilityIcon style={{ fontSize: '14px' }} /> View
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>No pending orders</p>
                  )}
                </div>
              </div>
            </div>
          </>
        } />

        {/* --- NESTED ROUTES --- */}
        {/* This renders the All Pets searchable table inside the dashboard */}
        <Route path="staff-patients" element={<StaffAllPets />} />

        <Route path="profile" element={<MyProfile />} />

        {/* Placeholder for Appointments */}
        <Route path="staff-appointments" element={<StaffAllAppointments />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />
        <Route path="manage-orders" element={<ManageOrders />} />
        <Route path="order-details/:orderId" element={<OrderDetails />} />

        {/* Catch-all to redirect back to main dashboard if path is wrong */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StaffDashboard;