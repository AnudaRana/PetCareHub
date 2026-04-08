import React, { useEffect, useMemo, useState } from 'react';
import '../../../styles/medical.css';
import TreatmentList from '../../medical/components/TreatmentList';
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

  return (
    <div className="medical-page-container">
      <div className="medical-page">
        <div className="topbar-breadcrumb" style={{ marginBottom: '16px' }}>
          <span className="breadcrumb-home">Medical Records</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Treatments</span>
        </div>
        <h1>Treatment Full List</h1>
        {pet && <p>Records for: <strong>{pet.name}</strong></p>}
        <TreatmentList treatments={sorted} isDoctor={isDoctor} onEdit={() => {}} />
      </div>
    </div>
  );
};

export default TreatmentPage;

