import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../../styles/medical.css';
import MedicalModal from '../components/MedicalModel';
import TreatmentList from '../components/TreatmentList';
import ConfirmationModal from '../components/ConfirmationModel';
import { useAuth } from '../../auth/contexts/AuthContext';
import { getTreatmentsByPetId, addTreatmentToPet } from '../../../services/medicalApi';

const sortByDateDesc = (items) => [...items].sort((a, b) => {
  const dateDiff = new Date(b.date) - new Date(a.date);
  if (dateDiff !== 0) return dateDiff;
  // Fallback to ID sorting for same-day records if ID exists
  return (b.id || 0) - (a.id || 0);
});

const PetMedicalRecordPage = () => {
  const [treatments, setTreatments] = useState([]);
  const [isTreatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [newTreatment, setNewTreatment] = useState({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);

  const location = useLocation();
  const pet = location.state?.pet;

  // Role logic kept for functional permissions
  const role = localStorage.getItem('role') || 'ROLE_OWNER';
  const isDoctor = role === 'ROLE_VET';
  const canViewDetails = ['ROLE_VET', 'ROLE_OWNER', 'ROLE_STAFF'].includes(role);

  useEffect(() => {
    const loadTreatments = async () => {
      if (!pet?.petId) return;
      try {
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
      }
    };
    loadTreatments();
  }, [pet]);

  const latestTreatments = useMemo(() => sortByDateDesc(treatments), [treatments]);

  const doSaveTreatment = async () => {
    if (!newTreatment.date || !newTreatment.doctorName.trim() || !newTreatment.doctorId.trim()) return;

    if (editingTreatmentId) {
      setTreatments((old) => old.map((t) => (t.id === editingTreatmentId ? { ...t, ...newTreatment, id: editingTreatmentId } : t)));
      setEditingTreatmentId(null);
      setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
      setTreatmentModalOpen(false);
      setSuccessTitle('Medical Record Updated!');
      setSuccessMessage('The medical treatment record has been successfully updated.');
      setShowSuccessModal(true);
      return;
    }

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
      setSuccessTitle('Medical Record Added!');
      setSuccessMessage('The medical treatment record has been successfully added.');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to save treatment:', err);
    } finally {
      setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
      setTreatmentModalOpen(false);
    }
  };

  const handleSaveRequest = () => setShowConfirmModal(true);
  const handleCancelSave = () => setShowConfirmModal(false);
  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await doSaveTreatment();
  };

  const handleEditTreatment = (id) => {
    const entry = treatments.find((t) => t.id === id);
    if (!entry) return;
    setNewTreatment({ ...entry });
    setEditingTreatmentId(id);
    setTreatmentModalOpen(true);
  };

  return (
    <div className="medical-page-container">
      <div className="medical-page">
        <h1>Pet Medical Record</h1>
        <p>Medical records for: <strong>{pet?.name || 'Unknown Pet'}</strong></p>

        <div className="medical-grid">
          <section className="medical-block">
            <div className="block-header">
              <div className="block-title">
                <h2>Medical Treatment</h2>
              </div>
              {isDoctor && (
                <button
                  className="btn btn-teal"
                  onClick={() => {
                    setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
                    setEditingTreatmentId(null);
                    setTreatmentModalOpen(true);
                  }}
                >
                  + Add Treatment
                </button>
              )}
            </div>

            {canViewDetails ? (
              <TreatmentList
                treatments={latestTreatments}
                isDoctor={isDoctor}
                onEdit={handleEditTreatment}
              />
            ) : (
              <div className="no-access">Details available for Owner/Staff/Doctor only.</div>
            )}
          </section>
        </div>
      </div>

      {/* Modals */}
      <MedicalModal
        title={editingTreatmentId ? 'Edit Treatment' : 'Add Treatment'}
        isOpen={isTreatmentModalOpen}
        onClose={() => { setTreatmentModalOpen(false); setEditingTreatmentId(null); }}
        onSave={handleSaveRequest}
        disabled={!newTreatment.date || !newTreatment.doctorName.trim() || !newTreatment.doctorId.trim()}
      >
        <label>Date<input type="date" value={newTreatment.date} onChange={(e) => setNewTreatment({ ...newTreatment, date: e.target.value })} /></label>
        <label>Diagnosis<input value={newTreatment.diagnosis} onChange={(e) => setNewTreatment({ ...newTreatment, diagnosis: e.target.value })} /></label>
        <label>Treatment notes<textarea value={newTreatment.notes} onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })} /></label>
        <label>Prescription<input value={newTreatment.prescription} onChange={(e) => setNewTreatment({ ...newTreatment, prescription: e.target.value })} /></label>
        <label>Physical observation<textarea value={newTreatment.observation} onChange={(e) => setNewTreatment({ ...newTreatment, observation: e.target.value })} /></label>
        <label>Doctor name<input required value={newTreatment.doctorName} onChange={(e) => setNewTreatment({ ...newTreatment, doctorName: e.target.value })} /></label>
        <label>Doctor ID<input required value={newTreatment.doctorId} onChange={(e) => setNewTreatment({ ...newTreatment, doctorId: e.target.value })} /></label>
      </MedicalModal>

      {showConfirmModal && (
        <div className="confirm-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-box">
            <p>Confirm changes and save medical treatment?</p>
            <div className="confirm-actions" style={{ justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-white" onClick={handleCancelSave}>Cancel</button>
              <button className="btn btn-teal" onClick={handleConfirmSave}>Confirm</button>
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