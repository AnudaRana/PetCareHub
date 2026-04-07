import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getPetsByOwner } from '../../../services/petService';
import { getOwnerOrders } from '../../../services/orderService';

// Import the actual page content components
import MyPets from '../../pet/components/owner/MyPets';
import MyProfile from './profile/MyProfile';
import DoctorChanneling from '../../appointment/pages/DoctorChanneling';
import MyAppointments from '../../appointment/pages/MyAppointments';
import PetMedicalRecordPage from '../../medical/pages/PetMedicalRecordPage';
import MyOrders from '../../order/pages/MyOrders';
import OrderDetails from '../../order/pages/OrderDetails';

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
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    petCount: 0,
    upcomingCount: 0,
    totalCount: 0,
    loading: true
  });
  const [latestOrders, setLatestOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

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
    
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await getOwnerOrders(user.userId);
        // show up to 3 most recent
        setLatestOrders((res.data || []).slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchStats();
    fetchOrders();
  }, [user?.userId]);

  const ownerMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'My Pets', icon: PetsOutlinedIcon, path: '/dashboard/pets' },
    { name: 'My Appointments', icon: CalendarTodayIcon, path: '/dashboard/appointments' },
    { name: 'Doctor Channeling', icon: BookOnlineOutlinedIcon, path: '/dashboard/doctor-channeling' },
    { name: 'Shop', icon: StoreIcon, path: '/store' },
  ];

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout menuItems={ownerMenu}>
      <Routes>
        {/* The default dashboard view (Home) */}
        <Route index element={
          <>
            <div className="dashboard-header-banner">
              <h2>Welcome back, {user?.firstName || user?.email}!</h2>
              <p>Manage your furry friends and appointments.</p>
            </div>

            <div className="owner-stats-layout">
              <div className="order-history-column">
                <div className="order-history-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0f23' }}>Order History</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>Your recent purchases</p>
                    </div>
                    <button 
                      className="btn btn-dark-blue"
                      onClick={() => navigate('/dashboard/my-orders')}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 16px', fontSize: '0.85rem'
                      }}>
                      <FormatListBulletedIcon fontSize="small" /> My Orders
                    </button>
                  </div>
                  <div className="order-history-content">
                    {ordersLoading ? (
                      <p style={{ margin: 0 }}>Loading orders...</p>
                    ) : latestOrders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {latestOrders.map(order => (
                          <div key={order.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div>
                              <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.9rem' }}>{order.orderNumber}</p>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                                <span style={{ 
                                  fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                                  backgroundColor: order.orderStatus === 'PENDING' ? '#fef3c7' : 
                                                   order.orderStatus === 'COMPLETED' ? '#d1fae5' : 
                                                   order.orderStatus === 'CANCELLED' ? '#fee2e2' : '#dbeafe',
                                  color: order.orderStatus === 'PENDING' ? '#d97706' : 
                                         order.orderStatus === 'COMPLETED' ? '#059669' : 
                                         order.orderStatus === 'CANCELLED' ? '#dc2626' : '#2563eb'
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
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>No orders found yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="secondary-stats-grid">
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>Registered Pets</h3>
                      <p>{stats.loading ? '...' : stats.petCount}</p>
                    </div>
                    <PetsOutlinedIcon style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>Upcoming</h3>
                      <p>{stats.loading ? '...' : stats.upcomingCount}</p>
                    </div>
                    <CalendarTodayIcon style={{ color: '#2dd4bf', opacity: 0.8 }} />
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>Total Appointments</h3>
                      <p>{stats.loading ? '...' : stats.totalCount}</p>
                    </div>
                    <HistoryIcon style={{ color: '#6366f1', opacity: 0.8 }} />
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>Current Orders</h3>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-light)', fontWeight: 500 }}>Coming Soon</p>
                    </div>
                    <LocalMallIcon style={{ color: '#f59e0b', opacity: 0.8 }} />
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>Upcoming Vaccines</h3>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-light)', fontWeight: 500 }}>Coming Soon</p>
                    </div>
                    <VaccinesIcon style={{ color: '#06b6d4', opacity: 0.8 }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        } />

        {/* Nested Pages that will appear in the "children" area */}
        <Route path="profile" element={<MyProfile />} />
        <Route path="pets" element={<MyPets />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="doctor-channeling" element={<DoctorChanneling />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="order-details/:orderId" element={<OrderDetails />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OwnerDashboard;