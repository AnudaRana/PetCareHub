import React, { useMemo, useState } from 'react';
import '../styles/medical.css';
import '../styles/Dashboard.css';
import VaccinationList from '../components/Medical/VaccinationList';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import StaffSidebar from '../components/staff/StaffSidebar';
import useCurrentUser from '../hooks/useCurrentUser';

const initialVaccinations = [
  { id: 1, date: '2026-03-10', vaccine: 'Rabies', booster: 'No', doctorName: 'Dr. Smith', doctorId: 'D-001' },
  { id: 2, date: '2025-12-18', vaccine: 'Distemper', booster: 'Yes', doctorName: 'Dr. Lane', doctorId: 'D-003' },
  { id: 3, date: '2025-09-09', vaccine: 'Parvo', booster: 'No', doctorName: 'Dr. Adams', doctorId: 'D-002' },
  { id: 4, date: '2025-06-20', vaccine: 'Leptospirosis', booster: 'Yes', doctorName: 'Dr. Eris', doctorId: 'D-004' },
];

const sortByDateDesc = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

const VaccinationPage = () => {
  const [vaccinations] = useState(initialVaccinations);
  const sorted = useMemo(() => sortByDateDesc(vaccinations), [vaccinations]);
  const role = localStorage.getItem('role') || 'ROLE_OWNER';
  const isDoctor = role === 'ROLE_VET';
  const user = useCurrentUser();

  const renderSidebar = () => {
    if (role === 'ROLE_VET') return <DoctorSidebar activeTab="" onTabChange={() => {}} doctor={user} />;
    if (role === 'ROLE_STAFF') return <StaffSidebar activeTab="" onTabChange={() => {}} staff={user} />;
    return <OwnerSidebar activeTab="" onTabChange={() => {}} user={user} />;
  };

  return (
    <div className="dashboard-layout">
      {renderSidebar()}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-home">Medical Records</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Vaccinations</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-user-section">
              <span className="topbar-greeting">
                Welcome, <strong>{user.fullName}</strong>
              </span>
              <div className="topbar-avatar" title="Profile">
                {user.initials}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="medical-page">
            <h1>Vaccination Full List</h1>
            <VaccinationList vaccinations={sorted} isDoctor={isDoctor} onEdit={() => {}} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VaccinationPage;
