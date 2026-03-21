import React, { useMemo, useState } from 'react';
import '../styles/medical.css';
import '../styles/Dashboard.css';
import TreatmentList from '../components/medical/TreatmentList';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import StaffSidebar from '../components/staff/StaffSidebar';
import useCurrentUser from '../hooks/useCurrentUser';

const initialTreatments = [
  { id: 1, date: '2026-03-14', diagnosis: 'Ear infection', notes: 'Cleaned ears, prescribed drops', prescription: 'Ear drops', observation: 'No fever', doctorName: 'Dr. Smith', doctorId: 'D-001' },
  { id: 2, date: '2026-02-25', diagnosis: 'Allergy', notes: 'Antihistamine for 7 days', prescription: 'Antihistamine', observation: 'Mild rash', doctorName: 'Dr. Adams', doctorId: 'D-002' },
  { id: 3, date: '2026-01-10', diagnosis: 'Sprained paw', notes: 'Rest and ice pack', prescription: 'None', observation: 'Limping improves', doctorName: 'Dr. Lane', doctorId: 'D-003' },
  { id: 4, date: '2025-11-30', diagnosis: 'Upset stomach', notes: 'Diet change', prescription: 'Probiotic', observation: 'Loose stool', doctorName: 'Dr. Eris', doctorId: 'D-004' },
];

const sortByDateDesc = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

const TreatmentPage = () => {
  const [treatments] = useState(initialTreatments);
  const sorted = useMemo(() => sortByDateDesc(treatments), [treatments]);
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
            <span className="breadcrumb-current">Treatments</span>
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
            <h1>Treatment Full List</h1>
            <TreatmentList treatments={sorted} isDoctor={isDoctor} onEdit={() => {}} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TreatmentPage;
