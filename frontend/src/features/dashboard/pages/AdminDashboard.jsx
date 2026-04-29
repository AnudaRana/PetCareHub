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
import FeedbackManagement from '../../feedback/pages/FeedbackManagement';
import ManageTimeSlots from '../../appointment/pages/ManageTimeSlots';
import ManageAppointments from '../../appointment/pages/ManageAppointments';

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
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';

const AdminDashboard = () => {
  const { user, loading: authLoading, token, hasRole } = useAuth();
  const isVet = hasRole('VET');

  // Removed admin stats logic as the home page now displays the profile instead

  const adminMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },

    ...(!isVet ? [
      { name: 'Manage Shop', icon: StoreOutlinedIcon, path: '/dashboard/manage-shop' },
      { name: 'Manage Orders', icon: ShoppingBagIcon, path: '/dashboard/manage-orders' },
      { name: 'Feedback Management', icon: FeedbackOutlinedIcon, path: '/dashboard/feedbacks' },
    ] : []),
    ...(isVet ? [
      { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/vet-patients' },
      { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/vet-appointments' },
      { name: 'Time Slots', icon: AccessTimeOutlinedIcon, path: '/dashboard/manage-slots' },
    ] : []),
    { name: 'Manage Staff', icon: PeopleAltOutlinedIcon, path: '/dashboard/manage-staff' },
    { name: 'Manage Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/manage-appointments' },
  ];

  if (authLoading) return <div className="loading-state">Loading Admin Dashboard...</div>;

  return (
    <DashboardLayout menuItems={adminMenu}>
      <Routes>
        <Route index element={<MyProfile />} />

        {/* Nested Admin Pages */}
        <Route path="manage-staff" element={<ManageStaff />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="vet-patients" element={<DoctorAllPets />} />
        <Route path="vet-appointments" element={<VetAppointments />} />
        <Route path="manage-orders" element={<ManageOrdersPage />} />
        <Route path="manage-shop" element={<ManageShopPage />} />
        <Route path="feedbacks" element={<FeedbackManagement />} />
        <Route path="manage-slots" element={<ManageTimeSlots />} />
        <Route path="manage-appointments" element={<ManageAppointments />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;