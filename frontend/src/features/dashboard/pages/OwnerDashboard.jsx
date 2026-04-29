import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StoreIcon from '@mui/icons-material/Store';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Removed dashboard stats logic as the home page now displays the profile instead

  const ownerMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'My Pets', icon: PetsOutlinedIcon, path: '/dashboard/pets' },
    { name: 'My Appointments', icon: CalendarTodayIcon, path: '/dashboard/appointments' },
    { name: 'Doctor Channeling', icon: BookOnlineOutlinedIcon, path: '/dashboard/doctor-channeling' },
    { name: 'Billing', icon: ReceiptLongOutlinedIcon, path: '/dashboard/billing' },
    { name: 'Shop', icon: StoreIcon, path: '/store' },
    { name: 'My Orders', icon: ShoppingBagIcon, path: '/dashboard/orders' },
  ];

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout menuItems={ownerMenu}>
      <Routes>
        <Route index element={<MyProfile />} />

        <Route path="profile" element={<MyProfile />} />
        <Route path="pets" element={<MyPets />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="doctor-channeling" element={<DoctorChanneling />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />
        <Route path="billing" element={<OwnerBillingPage />} />
        <Route path="billing/invoice/:orderId" element={<OwnerInvoicePage />} />
        <Route path="orders" element={<OwnerOrdersPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
