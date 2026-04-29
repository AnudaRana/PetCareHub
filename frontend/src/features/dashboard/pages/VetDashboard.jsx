import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DoctorAllPets from '../../pet/components/doctor/DoctorAllPets';
import MyProfile from './profile/MyProfile';
import VetAppointments from '../../appointment/pages/VetAppointments';
import PetMedicalRecordPage from '../../medical/pages/PetMedicalRecordPage';
import ManageTimeSlots from '../../appointment/pages/ManageTimeSlots';
import { getAllPets } from '../../../services/petService';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

const VetDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const vetMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/vet-patients' },
    { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/vet-appointments' },
    { name: 'Time Slots', icon: AccessTimeOutlinedIcon, path: '/dashboard/manage-slots' },
  ];

  if (loading) return <div className="loading-state">Syncing Professional Data...</div>;

  return (
    <DashboardLayout menuItems={vetMenu}>
      <Routes>
        <Route index element={<MyProfile />} />

        <Route path="vet-patients" element={<DoctorAllPets />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="vet-appointments" element={<VetAppointments />} />
        <Route path="manage-slots" element={<ManageTimeSlots />} />
        <Route path="pet-medical-record" element={<PetMedicalRecordPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default VetDashboard;