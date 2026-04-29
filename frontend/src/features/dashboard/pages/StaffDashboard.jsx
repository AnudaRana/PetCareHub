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
  // Removed staff stats logic as the home page now displays the profile instead

  const staffMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'All Pets', icon: HealingOutlinedIcon, path: '/dashboard/staff-patients' },
    { name: 'Clinical Appointments', icon: ContentPasteSearchOutlinedIcon, path: '/dashboard/staff-appointments' },
    { name: 'Receipts', icon: ReceiptLongOutlinedIcon, path: '/dashboard/receipts' },
    { name: 'Manage Shop', icon: StoreOutlinedIcon, path: '/dashboard/manage-shop' },
    { name: 'Manage Orders', icon: ShoppingBagIcon, path: '/dashboard/manage-orders' },
    { name: 'Feedback Management', icon: FeedbackOutlinedIcon, path: '/dashboard/feedbacks' },
  ];

  if (authLoading) return <div className="loading-state">Syncing Operational Hub...</div>;

  return (
    <DashboardLayout menuItems={staffMenu}>
      <Routes>
        <Route index element={<MyProfile />} />

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
