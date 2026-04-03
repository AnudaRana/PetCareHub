import React, { useEffect, useMemo, useState } from 'react';
import '../styles/medical.css';
import TreatmentList from '../../medical/components/TreatmentList';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getTreatmentsByPetId } from '../../../services/medicalApi';

const sortByDateDesc = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

const TreatmentPage = () => {
  const [treatments, setTreatments] = useState([]);
  const location = useLocation();
  const pet = location.state?.pet;

  useEffect(() => {
    const load = async () => {
      if (!pet?.petId) return;
      try {
        const apiTreatments = await getTreatmentsByPetId(pet.petId);
        setTreatments(apiTreatments.map((t) => ({
          id: t.id,
          date: t.treatmentDate,
          diagnosis: t.diagnosis || '',
          notes: t.treatmentNotes || '',
          prescription: t.prescriptions || '',
          observation: t.physicalObservation || '',
          doctorName: t.doctorName || '',
          doctorId: t.doctorId || '',
        })));
      } catch (err) {
        console.error('Failed to load treatments:', err);
      }
    };
    load();
  }, [pet]);

  const sorted = useMemo(() => sortByDateDesc(treatments), [treatments]);
  const role = localStorage.getItem('role') || 'ROLE_OWNER';
  const isDoctor = role === 'ROLE_VET';
  const user = useAuth()?.user;

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
