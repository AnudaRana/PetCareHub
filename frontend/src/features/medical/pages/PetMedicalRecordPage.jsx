import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../../styles/medical.css';
import MedicalModal from '../components/MedicalModel';
import TreatmentList from '../components/TreatmentList';
import VaccinationList from '../components/VaccinationList';
import ConfirmationModal from '../components/ConfirmationModel';
import { useAuth } from '../../auth/contexts/AuthContext';
import { getTreatmentsByPetId, addTreatmentToPet } from '../../../services/medicalApi';
import { getVaccinationsByPetId, addVaccinationToPet } from '../../../services/vaccinationApi';

const sortByDateDesc = (items) => [...items].sort((a, b) => {
  const dateDiff = new Date(b.date) - new Date(a.date);
  if (dateDiff !== 0) return dateDiff;
  return (b.id || 0) - (a.id || 0);
});

const PetMedicalRecordPage = () => {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [isTreatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [isVaccinationModalOpen, setVaccinationModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('treatment');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [newTreatment, setNewTreatment] = useState({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
  const [newVaccination, setNewVaccination] = useState({ vaccinationDate: '', vaccinationName: '', dose: '', description: '', doctorName: '', doctorId: '' });
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const pet = location.state?.pet;
  const { user } = useAuth();

  const role = user?.role || localStorage.getItem('role') || 'ROLE_OWNER';
  const isDoctor = role === 'ROLE_VET' || role === 'VET';
  const canModify = isDoctor;

  useEffect(() => {
    if (!pet) {
        navigate('/dashboard');
        return;
    }
    loadTreatments();
    loadVaccinations();
  }, [pet]);

  const loadTreatments = async () => {
    if (!pet?.petId) return;
    try {
      setLoading(true);
      const apiTreatments = await getTreatmentsByPetId(pet.petId);
      const mappedTreatments = apiTreatments.map((t) => ({
        id: t.id,
        date: t.treatmentDate,
        diagnosis: t.diagnosis || '',
        notes: t.treatmentNotes || '',
        prescription: t.prescriptions || '',
        observation: t.physicalObservation || '',
        doctorName: t.doctorName || '',
        doctorId: t.doctorId || '',
      }));
      setTreatments(mappedTreatments);
    } catch (err) {
      console.error('Failed to load treatments:', err);
    } finally {
        setLoading(false);
    }
  };

  const loadVaccinations = async () => {
    if (!pet?.petId) return;
    try {
      const apiVaccinations = await getVaccinationsByPetId(pet.petId);
      const mappedVaccinations = apiVaccinations.map((v) => ({
        id: v.id,
        vaccinationDate: v.vaccinationDate,
        vaccinationName: v.vaccinationName || '',
        dose: v.dose || '',
        description: v.description || '',
        doctorName: v.doctorName || '',
        doctorId: v.doctorId || '',
      }));
      setVaccinations(mappedVaccinations);
    } catch (err) {
      console.error('Failed to load vaccinations:', err);
    }
  };

  const latestTreatments = useMemo(() => sortByDateDesc(treatments), [treatments]);
  const latestVaccinations = useMemo(() => [...vaccinations].sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate)), [vaccinations]);

  const doSaveTreatment = async () => {
    if (!newTreatment.date || !newTreatment.doctorName.trim() || !newTreatment.doctorId.trim()) return;

    if (!pet?.petId) return;

    try {
      const dto = {
        treatmentDate: newTreatment.date,
        diagnosis: newTreatment.diagnosis,
        treatmentNotes: newTreatment.notes,
        prescriptions: newTreatment.prescription,
        physicalObservation: newTreatment.observation,
        doctorName: newTreatment.doctorName,
        doctorId: newTreatment.doctorId,
      };

      const saved = await addTreatmentToPet(pet.petId, dto);
      const savedTreatment = {
        id: saved.id,
        date: saved.treatmentDate,
        diagnosis: saved.diagnosis || '',
        notes: saved.treatmentNotes || '',
        prescription: saved.prescriptions || '',
        observation: saved.physicalObservation || '',
        doctorName: saved.doctorName || '',
        doctorId: saved.doctorId || '',
      };

      setTreatments((old) => [savedTreatment, ...old]);
      setSuccessTitle('Medical Record Finalized');
      setSuccessMessage('The clinical treatment documentation has been successfully archived.');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to save treatment:', err);
    } finally {
      setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
      setTreatmentModalOpen(false);
    }
  };

  const doSaveVaccination = async () => {
    if (!newVaccination.vaccinationDate || !newVaccination.vaccinationName.trim() || !newVaccination.dose.trim() || !newVaccination.doctorName.trim() || !newVaccination.doctorId.trim()) return;

    if (!pet?.petId) return;

    try {
      const dto = {
        vaccinationDate: newVaccination.vaccinationDate,
        vaccinationName: newVaccination.vaccinationName,
        dose: newVaccination.dose,
        description: newVaccination.description,
        doctorName: newVaccination.doctorName,
        doctorId: newVaccination.doctorId,
      };

      const saved = await addVaccinationToPet(pet.petId, dto);
      const savedVaccination = {
        id: saved.id,
        vaccinationDate: saved.vaccinationDate,
        vaccinationName: saved.vaccinationName || '',
        dose: saved.dose || '',
        description: saved.description || '',
        doctorName: saved.doctorName || '',
        doctorId: saved.doctorId || '',
      };

      setVaccinations((old) => [savedVaccination, ...old]);
      setSuccessTitle('Vaccination Saved');
      setSuccessMessage('The vaccination record has been successfully finalized and archived.');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to save vaccination:', err);
    } finally {
      setNewVaccination({ vaccinationDate: '', vaccinationName: '', dose: '', description: '', doctorName: '', doctorId: '' });
      setVaccinationModalOpen(false);
    }
  };

  const handleSaveRequest = (action = 'treatment') => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    if (confirmAction === 'vaccination') {
      await doSaveVaccination();
    } else {
      await doSaveTreatment();
    }
  };

  const handleEditTreatment = (id) => {
    // Currently limited to viewing/editing for doctors if applicable
    const entry = treatments.find((t) => t.id === id);
    if (!entry) return;
    setNewTreatment({ ...entry });
    setEditingTreatmentId(id);
    setTreatmentModalOpen(true);
  };

  return (
    <div className="medical-page-container animate-fade-up">
      <div className="medical-page">
        <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
            <h1 className="section-title">Clinical History & Registry</h1>
            <p style={{ margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="pet-detail-species-badge" style={{ margin: 0 }}>{pet?.species?.toUpperCase()}</span>
                Comprehensive records for <strong>{pet?.name}</strong> (Registry ID: HUB-{pet?.petId})
            </p>
        </header>

        <div className="medical-grid">
          <section className="medical-block">
            <header className="block-header">
              <h2>Medical Treatments & Diagnoses</h2>
              {canModify && (
                <button
                  className="btn btn-teal"
                  onClick={() => {
                    setNewTreatment({ 
                        date: new Date().toISOString().split('T')[0], 
                        diagnosis: '', notes: '', prescription: '', observation: '', 
                        doctorName: user?.fullName || '', 
                        doctorId: `VET-${user?.userId || ''}` 
                    });
                    setEditingTreatmentId(null);
                    setTreatmentModalOpen(true);
                  }}
                >
                  + Add Clinical Entry
                </button>
              )}
            </header>

            {loading ? (
                 <div className="loading-container" style={{ padding: '80px 0' }}>
                    <div className="spinner" />
                    <p style={{ color: 'var(--color-text-light)', marginTop: '16px', fontWeight: 500 }}>Accessing Vault...</p>
                </div>
            ) : treatments.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 20px' }}>
                    <span className="empty-state-icon">📋</span>
                    <h3>No medical history found</h3>
                    <p>This patient has no clinical treatment records registered in the system.</p>
                </div>
            ) : (
                <TreatmentList
                  treatments={latestTreatments}
                  isDoctor={isDoctor}
                  onEdit={handleEditTreatment}
                />
            )}
          </section>

          <section className="medical-block">
            <header className="block-header">
              <h2>Vaccinations & Immunizations</h2>
              {canModify && (
                <button
                  className="btn btn-teal"
                  onClick={() => {
                    setNewVaccination({ 
                        vaccinationDate: new Date().toISOString().split('T')[0], 
                        vaccinationName: '', dose: '', description: '', 
                        doctorName: user?.fullName || '', 
                        doctorId: `VET-${user?.userId || ''}` 
                    });
                    setVaccinationModalOpen(true);
                  }}
                >
                  + Add Vaccination
                </button>
              )}
            </header>

            {vaccinations.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 20px' }}>
                    <span className="empty-state-icon">💉</span>
                    <h3>No vaccination history available</h3>
                    <p>This patient does not have any vaccination records yet.</p>
                </div>
            ) : (
                <VaccinationList vaccinations={latestVaccinations} />
            )}
          </section>
        </div>
      </div>

      {/* Modern High-Fidelity Modal for Adding Record */}
      {isTreatmentModalOpen && (
          <div className="modal-overlay" onClick={() => setTreatmentModalOpen(false)}>
              <div className="modal-container" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                  <header className="modal-header">
                      <h2>{editingTreatmentId ? 'Modify Clinical Entry' : 'New Medical Documentation'}</h2>
                      <button className="close-btn" onClick={() => setTreatmentModalOpen(false)}>✕</button>
                  </header>
                  
                  <div className="modal-body" style={{ padding: '24px' }}>
                      <form className="premium-form" onSubmit={(e) => { e.preventDefault(); handleSaveRequest('treatment'); }}>
                          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                              <label>Visit Date
                                  <input type="date" value={newTreatment.date} onChange={(e) => setNewTreatment({ ...newTreatment, date: e.target.value })} required />
                              </label>
                              <label>Patient ID
                                  <input type="text" value={`HUB-${pet.petId} - ${pet.name}`} disabled />
                              </label>
                          </div>

                          <label>Primary Diagnosis
                              <input value={newTreatment.diagnosis} onChange={(e) => setNewTreatment({ ...newTreatment, diagnosis: e.target.value })} placeholder="e.g. Chronic Kidney Disease" required />
                          </label>
                          
                          <label>Clinical Observations
                              <textarea rows="3" value={newTreatment.observation} onChange={(e) => setNewTreatment({ ...newTreatment, observation: e.target.value })} placeholder="Observations during vitals check..." />
                          </label>

                          <label>Treatment Plan & Notes
                              <textarea rows="3" value={newTreatment.notes} onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })} placeholder="Details of treatment administered..." />
                          </label>

                          <label>Prescriptions
                              <input value={newTreatment.prescription} onChange={(e) => setNewTreatment({ ...newTreatment, prescription: e.target.value })} placeholder="Dosage, frequency, medications..." />
                          </label>

                          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <label>Signing Doctor
                                  <input value={newTreatment.doctorName} onChange={(e) => setNewTreatment({ ...newTreatment, doctorName: e.target.value })} required />
                              </label>
                              <label>Doctor ID
                                  <input value={newTreatment.doctorId} onChange={(e) => setNewTreatment({ ...newTreatment, doctorId: e.target.value })} required />
                              </label>
                          </div>

                          <div className="modal-actions" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                              <button type="button" className="btn btn-white" onClick={() => setTreatmentModalOpen(false)} style={{ flex: 1 }}>Discard</button>
                              <button type="submit" className="btn btn-teal" style={{ flex: 2 }}>{editingTreatmentId ? 'Update Record' : 'Finalize & Archive'}</button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}

      {isVaccinationModalOpen && (
          <div className="modal-overlay" onClick={() => setVaccinationModalOpen(false)}>
              <div className="modal-container" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                  <header className="modal-header">
                      <h2>New Vaccination Record</h2>
                      <button className="close-btn" onClick={() => setVaccinationModalOpen(false)}>✕</button>
                  </header>

                  <div className="modal-body" style={{ padding: '24px' }}>
                      <form className="premium-form" onSubmit={(e) => { e.preventDefault(); handleSaveRequest('vaccination'); }}>
                          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                              <label>Vaccination Date
                                  <input type="date" value={newVaccination.vaccinationDate} onChange={(e) => setNewVaccination({ ...newVaccination, vaccinationDate: e.target.value })} required />
                              </label>
                              <label>Patient ID
                                  <input type="text" value={`HUB-${pet.petId} - ${pet.name}`} disabled />
                              </label>
                          </div>

                          <label>Vaccination Name
                              <input value={newVaccination.vaccinationName} onChange={(e) => setNewVaccination({ ...newVaccination, vaccinationName: e.target.value })} placeholder="e.g. Rabies, DHPP" required />
                          </label>

                          <label>Dose Administered
                              <input value={newVaccination.dose} onChange={(e) => setNewVaccination({ ...newVaccination, dose: e.target.value })} placeholder="e.g. 1 mL, 2 doses" required />
                          </label>

                          <label>Administration Notes
                              <textarea rows="3" value={newVaccination.description} onChange={(e) => setNewVaccination({ ...newVaccination, description: e.target.value })} placeholder="Describe why this vaccination was given..." />
                          </label>

                          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <label>Signing Doctor
                                  <input value={newVaccination.doctorName} onChange={(e) => setNewVaccination({ ...newVaccination, doctorName: e.target.value })} required />
                              </label>
                              <label>Doctor ID
                                  <input value={newVaccination.doctorId} onChange={(e) => setNewVaccination({ ...newVaccination, doctorId: e.target.value })} required />
                              </label>
                          </div>

                          <div className="modal-actions" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                              <button type="button" className="btn btn-white" onClick={() => setVaccinationModalOpen(false)} style={{ flex: 1 }}>Discard</button>
                              <button type="submit" className="btn btn-teal" style={{ flex: 2 }}>Finalize & Archive</button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}

      {showConfirmModal && (
        <div className="confirm-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-box">
            <h3>Final Authorization</h3>
            <p>Confirm integrity and archive this {confirmAction === 'vaccination' ? 'vaccination' : 'medical treatment'} record to the vault?</p>
            <div className="confirm-actions">
              <button className="btn btn-white" onClick={() => setShowConfirmModal(false)} style={{ flex: 1 }}>Review</button>
              <button className="btn btn-teal" onClick={handleConfirmSave} style={{ flex: 2 }}>Yes, Archive Record</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showSuccessModal}
        title={successTitle}
        message={successMessage}
        onDone={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default PetMedicalRecordPage;