import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/medical.css';
import '../styles/Dashboard.css';
import MedicalModal from '../components/Medical/MedicalModel';
import TreatmentList from '../components/Medical/TreatmentList';
import VaccinationList from '../components/Medical/VaccinationList';
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

const initialVaccinations = [
  { id: 1, date: '2026-03-10', vaccine: 'Rabies', booster: 'No', doctorName: 'Dr. Smith', doctorId: 'D-001' },
  { id: 2, date: '2025-12-18', vaccine: 'Distemper', booster: 'Yes', doctorName: 'Dr. Lane', doctorId: 'D-003' },
  { id: 3, date: '2025-09-09', vaccine: 'Parvo', booster: 'No', doctorName: 'Dr. Adams', doctorId: 'D-002' },
  { id: 4, date: '2025-06-20', vaccine: 'Leptospirosis', booster: 'Yes', doctorName: 'Dr. Eris', doctorId: 'D-004' },
];

const sortByDateDesc = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

const PetMedicalRecordPage = () => {
  const [treatments, setTreatments] = useState(initialTreatments);
  const [vaccinations, setVaccinations] = useState(initialVaccinations);
  const [isTreatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [isVaccinationModalOpen, setVaccinationModalOpen] = useState(false);
  const [newTreatment, setNewTreatment] = useState({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
  const [newVaccination, setNewVaccination] = useState({ date: '', vaccine: '', booster: '', doctorName: '', doctorId: '' });
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);
  const [editingVaccinationId, setEditingVaccinationId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const pet = location.state?.pet;
  const role = localStorage.getItem('role') || 'ROLE_OWNER';
  const isDoctor = role === 'ROLE_VET';
  const canViewDetails = ['ROLE_VET', 'ROLE_OWNER', 'ROLE_STAFF'].includes(role);
  const user = useCurrentUser();

  const latestTreatments = useMemo(() => sortByDateDesc(treatments).slice(0, 3), [treatments]);
  const latestVaccinations = useMemo(() => sortByDateDesc(vaccinations).slice(0, 3), [vaccinations]);

  const renderSidebar = () => {
    if (role === 'ROLE_VET') return <DoctorSidebar activeTab="" onTabChange={() => {}} doctor={user} />;
    if (role === 'ROLE_STAFF') return <StaffSidebar activeTab="" onTabChange={() => {}} staff={user} />;
    return <OwnerSidebar activeTab="" onTabChange={() => {}} user={user} />;
  };

  const handleTreatmentSave = () => {
    if (!newTreatment.doctorName.trim() || !newTreatment.doctorId.trim()) return;
    if (editingTreatmentId) {
      setTreatments((old) => old.map((t) => (t.id === editingTreatmentId ? { ...t, ...newTreatment, id: editingTreatmentId } : t)));
      setEditingTreatmentId(null);
    } else {
      setTreatments((old) => [{ ...newTreatment, id: Date.now() }, ...old]);
    }
    setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
    setTreatmentModalOpen(false);
  };

  const handleVaccinationSave = () => {
    if (!newVaccination.doctorName.trim() || !newVaccination.doctorId.trim()) return;
    if (editingVaccinationId) {
      setVaccinations((old) => old.map((v) => (v.id === editingVaccinationId ? { ...v, ...newVaccination, id: editingVaccinationId } : v)));
      setEditingVaccinationId(null);
    } else {
      setVaccinations((old) => [{ ...newVaccination, id: Date.now() }, ...old]);
    }
    setNewVaccination({ date: '', vaccine: '', booster: '', doctorName: '', doctorId: '' });
    setVaccinationModalOpen(false);
  };

  const handleEditTreatment = (id) => {
    const entry = treatments.find((t) => t.id === id);
    if (!entry) return;
    setNewTreatment({ ...entry });
    setEditingTreatmentId(id);
    setTreatmentModalOpen(true);
  };

  const handleEditVaccination = (id) => {
    const entry = vaccinations.find((v) => v.id === id);
    if (!entry) return;
    setNewVaccination({ ...entry });
    setEditingVaccinationId(id);
    setVaccinationModalOpen(true);
  };

  return (
    <div className="dashboard-layout">
      {renderSidebar()}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-home">Medical Records</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Pet Medical Record</span>
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
            <h1>Pet Medical Record</h1>
            <p>Medical records for: <strong>{pet?.name || 'Unknown Pet'}</strong></p>
            <div className="medical-grid">
              <section className="medical-block">
                <div className="block-header">
                  <div className="block-title" onClick={() => navigate('/treatments')}>
                    <h2>Medical Treatment</h2>
                    <span className="link-text">Open full list</span>
                  </div>
                  {isDoctor && (
                    <button className="btn btn-add btn-add-inline" onClick={() => { setEditingTreatmentId(null); setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' }); setTreatmentModalOpen(true); }}>
                      Add
                    </button>
                  )}
                </div>
                {canViewDetails ? (
                  <TreatmentList treatments={latestTreatments} isDoctor={isDoctor} onEdit={handleEditTreatment} />
                ) : (
                  <div className="no-access">Details available for Owner/Staff/Doctor only.</div>
                )}
              </section>

              <section className="medical-block">
                <div className="block-header">
                  <div className="block-title" onClick={() => navigate('/vaccinations')}>
                    <h2>Vaccination</h2>
                    <span className="link-text">Open full list</span>
                  </div>
                  {isDoctor && (
                    <button className="btn btn-add btn-add-inline" onClick={() => { setEditingVaccinationId(null); setNewVaccination({ date: '', vaccine: '', booster: '', doctorName: '', doctorId: '' }); setVaccinationModalOpen(true); }}>
                      Add
                    </button>
                  )}
                </div>
                {canViewDetails ? (
                  <VaccinationList vaccinations={latestVaccinations} isDoctor={isDoctor} onEdit={handleEditVaccination} />
                ) : (
                  <div className="no-access">Details available for Owner/Staff/Doctor only.</div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      <MedicalModal
        title={editingTreatmentId ? 'Edit Treatment' : 'Add Treatment'}
        isOpen={isTreatmentModalOpen}
        onClose={() => { setTreatmentModalOpen(false); setEditingTreatmentId(null); }}
        onSave={handleTreatmentSave}
        disabled={!newTreatment.doctorName.trim() || !newTreatment.doctorId.trim()}
      >
        <label>Date<input type="date" value={newTreatment.date} onChange={(e) => setNewTreatment({ ...newTreatment, date: e.target.value })} /></label>
        <label>Diagnosis<input value={newTreatment.diagnosis} onChange={(e) => setNewTreatment({ ...newTreatment, diagnosis: e.target.value })} /></label>
        <label>Treatment notes<textarea value={newTreatment.notes} onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })} /></label>
        <label>Prescription<input value={newTreatment.prescription} onChange={(e) => setNewTreatment({ ...newTreatment, prescription: e.target.value })} /></label>
        <label>Physical observation<textarea value={newTreatment.observation} onChange={(e) => setNewTreatment({ ...newTreatment, observation: e.target.value })} /></label>
        <label>Doctor name<input required value={newTreatment.doctorName} onChange={(e) => setNewTreatment({ ...newTreatment, doctorName: e.target.value })} /></label>
        <label>Doctor ID<input required value={newTreatment.doctorId} onChange={(e) => setNewTreatment({ ...newTreatment, doctorId: e.target.value })} /></label>
      </MedicalModal>

      <MedicalModal
        title={editingVaccinationId ? 'Edit Vaccination' : 'Add Vaccination'}
        isOpen={isVaccinationModalOpen}
        onClose={() => { setVaccinationModalOpen(false); setEditingVaccinationId(null); }}
        onSave={handleVaccinationSave}
        disabled={!newVaccination.doctorName.trim() || !newVaccination.doctorId.trim()}
      >
        <label>Date<input type="date" value={newVaccination.date} onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })} /></label>
        <label>Vaccine<input value={newVaccination.vaccine} onChange={(e) => setNewVaccination({ ...newVaccination, vaccine: e.target.value })} /></label>
        <label>Booster<input value={newVaccination.booster} onChange={(e) => setNewVaccination({ ...newVaccination, booster: e.target.value })} /></label>
        <label>Doctor name<input required value={newVaccination.doctorName} onChange={(e) => setNewVaccination({ ...newVaccination, doctorName: e.target.value })} /></label>
        <label>Doctor ID<input required value={newVaccination.doctorId} onChange={(e) => setNewVaccination({ ...newVaccination, doctorId: e.target.value })} /></label>
      </MedicalModal>
    </div>
  );
};

export default PetMedicalRecordPage;
