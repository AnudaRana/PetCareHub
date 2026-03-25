import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/petService';
import { getTreatmentsByPetId, addTreatmentToPet } from '../../services/medicalApi';
import MedicalModal from '../medical/MedicalModel';
import ConfirmationModal from '../medical/ConfirmationModal';
import useCurrentUser from '../../hooks/useCurrentUser';
import '../../styles/PetDetail.css';
import '../../styles/DoctorDashboard.css';
import '../../styles/medical.css';

const SPECIES_EMOJI = { Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇', Fish: '🐟' };

const calcAge = (dob) => {
  if (!dob) return 'Unknown';
  const today = new Date();
  const birth = new Date(dob);
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  if (years === 0) return `${months < 0 ? 0 : months} months`;
  return `${years} year${years > 1 ? 's' : ''}`;
};

const DoctorPetDetail = ({ pet, onClose }) => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [treatments, setTreatments] = useState([]);
  const [isMedicalModalOpen, setMedicalModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newTreatment, setNewTreatment] = useState({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
  
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
        })).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date desc
        setTreatments(mappedTreatments);
      } catch (err) {
        console.error('Failed to load treatments:', err);
      }
    };
    loadTreatments();
  }, [pet?.petId]);
  
  if (!pet) return null;
  const emoji = SPECIES_EMOJI[pet.species] || '🐾';

  const doSaveTreatment = async () => {
    if (!newTreatment.doctorName.trim() || !newTreatment.doctorId.trim()) return;

    if (!pet?.petId) {
      console.error('No pet selected for treatment.');
      return;
    }

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
      setMedicalModalOpen(false);
      setSuccessTitle('Medical Record Added!');
      setSuccessMessage('The medical treatment record has been successfully added. Thank you for using our services!');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to save treatment:', err);
    } finally {
      setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' });
    }
  };

  const handleSaveRequest = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await doSaveTreatment();
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

  return (
    <div
      className="pet-detail-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${pet.name}'s profile`}
    >
      <div className="pet-detail-panel doc-pet-detail-panel" onClick={e => e.stopPropagation()}>
        {/* Header with pet image */}
        <div className="pet-detail-header doc-pet-detail-header">
          {pet.petImagePath ? (
            <img src={`${API_BASE_URL}/${pet.petImagePath}`} alt={pet.name} />
          ) : (
            <div className="pet-detail-avatar-fallback">
              <span>{emoji}</span>
            </div>
          )}
          <button className="pet-detail-back-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pet-detail-body">
          <div className="pet-detail-title-row">
            <h2 className="pet-detail-name">{pet.name}</h2>
            <span className="pet-detail-species-badge">{pet.species}</span>
          </div>

          {/* Owner info — doctor exclusive */}
          <div className="doc-owner-info-card">
            <div className="doc-owner-info-label">👤 Owner</div>
            <div className="doc-owner-info-value">{pet.ownerName || '—'}</div>
            <div className="doc-owner-info-sub">Owner of this pet</div>
          </div>

          <div className="pet-detail-grid">
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Breed</div>
              <div className="pet-detail-field-value">{pet.breed || 'Mixed / Unknown'}</div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Gender</div>
              <div className="pet-detail-field-value">
                {pet.gender === 'MALE' ? '♂ Male' : pet.gender === 'FEMALE' ? '♀ Female' : '? Unknown'}
              </div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Age</div>
              <div className="pet-detail-field-value">{calcAge(pet.dateOfBirth)}</div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Date of Birth</div>
              <div className="pet-detail-field-value">
                {pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString('en-GB') : '—'}
              </div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Weight</div>
              <div className="pet-detail-field-value">{pet.weight ? `${pet.weight} kg` : '—'}</div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Pet ID</div>
              <div className="pet-detail-field-value">#{pet.petId}</div>
            </div>

            {pet.knownIllnesses && (
              <div className="pet-detail-field full-width pet-detail-illnesses">
                <div className="pet-detail-field-label">Known Illnesses / Conditions</div>
                <div className="pet-detail-field-value">{pet.knownIllnesses}</div>
              </div>
            )}
          </div>

          {/* Medical History Section */}
          <div className="doc-medical-section">
            <div className="doc-medical-title">
              <span>📋</span> Medical History & Treatment Records
            </div>
            {treatments.length > 0 ? (
              <div className="doc-medical-content">
                <div className="doc-latest-treatment">
                  <div className="doc-treatment-header">
                    <span>🩺 Latest Treatment</span>
                    <span className="doc-treatment-date">{new Date(treatments[0].date).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="doc-treatment-details">
                    <div><strong>Diagnosis:</strong> {treatments[0].diagnosis}</div>
                    <div><strong>Notes:</strong> {treatments[0].notes}</div>
                    {treatments[0].prescription && <div><strong>Prescription:</strong> {treatments[0].prescription}</div>}
                    {treatments[0].observation && <div><strong>Observation:</strong> {treatments[0].observation}</div>}
                    <div><strong>Doctor:</strong> {treatments[0].doctorName}</div>
                  </div>
                </div>
                <div className="doc-view-full-link">
                  <button 
                    className="pet-detail-btn secondary small"
                    onClick={() => navigate('/pet-medical-record', { state: { pet } })}
                  >
                    View Full Medical Records ({treatments.length})
                  </button>
                </div>
              </div>
            ) : (
              <div className="doc-medical-empty">
                <span>🩺</span>
                <p>No medical records available yet.</p>
                <small>Medical history will appear here once records are added.</small>
              </div>
            )}
          </div>

          {/* Actions — doctor can add medical records */}
          <div className="pet-detail-actions">
            <button className="pet-detail-btn secondary" onClick={onClose}>
              Close
            </button>
            <button 
              className="pet-detail-btn primary" 
              onClick={() => setMedicalModalOpen(true)}
            >
              + Add Medical Record
            </button>
          </div>

          <p className="pet-detail-registered">
            Registered on {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('en-GB') : '—'}
          </p>
        </div>
      </div>

      <MedicalModal
        title="Add Treatment"
        isOpen={isMedicalModalOpen}
        onClose={() => { setMedicalModalOpen(false); setNewTreatment({ date: '', diagnosis: '', notes: '', prescription: '', observation: '', doctorName: '', doctorId: '' }); }}
        onSave={handleSaveRequest}
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

      {showConfirmModal && (
        <div className="confirm-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-box">
            <p>Confirm changes and save medical treatment?</p>
            <div className="confirm-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-cancel" onClick={handleCancelSave}>Cancel</button>
              <button className="btn btn-save" onClick={handleConfirmSave}>Confirm</button>
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

export default DoctorPetDetail;
