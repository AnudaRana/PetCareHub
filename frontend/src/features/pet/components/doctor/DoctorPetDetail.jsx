import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../services/petService';
import { getTreatmentsByPetId } from '../../../../services/medicalApi';
import { useAuth } from '../../../auth/contexts/AuthContext';
import '../../../../styles/PetDetail.css';
import '../../../../styles/medical.css';

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

const INITIAL_RECORD_FORM = {
  treatmentDate: '',
  diagnosis: '',
  doctorName: '',
  doctorId: '',
  treatmentNotes: '',
  prescriptions: '',
  physicalObservation: '',
};

const DoctorPetDetail = ({ pet, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState(INITIAL_RECORD_FORM);
  const [recordError, setRecordError] = useState('');
  const [recordSuccess, setRecordSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [treatments, setTreatments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (pet?.petId) {
      fetchHistory();
    }
  }, [pet]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getTreatmentsByPetId(pet.petId);
      setTreatments(data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };


  if (!pet) return null;
  const emoji = SPECIES_EMOJI[pet.species] || '🐾';

  const openRecordModal = () => {
    setRecordForm({
      ...INITIAL_RECORD_FORM,
      doctorName: user?.fullName || '',
      doctorId: `VET-${user?.userId || ''}`,
      treatmentDate: new Date().toISOString().split('T')[0]
    });
    setRecordError('');
    setRecordSuccess(false);
    setShowRecordModal(true);
  };

  const closeRecordModal = () => {
    setShowRecordModal(false);
    setRecordForm(INITIAL_RECORD_FORM);
    setRecordError('');
    setRecordSuccess(false);
  };

  const handleRecordChange = (e) => {
    const { name, value } = e.target;
    setRecordForm((prev) => ({ ...prev, [name]: value }));
    setRecordError('');
  };

  const submitRecord = async (e) => {
    e.preventDefault();
    if (!recordForm.treatmentDate) {
      setRecordError('Visit date is required.');
      return;
    }
    if (!recordForm.diagnosis.trim()) {
      setRecordError('Diagnosis is required.');
      return;
    }
    if (!recordForm.doctorName.trim()) {
      setRecordError('Doctor name is required.');
      return;
    }
    if (!recordForm.doctorId.trim()) {
      setRecordError('Doctor ID is required.');
      return;
    }

    setSubmitting(true);
    setRecordError('');

    try {
      await axios.post(
        `${API_BASE_URL}/api/medical-records/treatments/pet/${pet.petId}`,
        {
          treatmentDate: recordForm.treatmentDate,
          diagnosis: recordForm.diagnosis,
          doctorName: recordForm.doctorName,
          doctorId: recordForm.doctorId,
          treatmentNotes: recordForm.treatmentNotes,
          prescriptions: recordForm.prescriptions,
          physicalObservation: recordForm.physicalObservation,
        }
      );
      setRecordSuccess(true);
      fetchHistory(); // Immediate refresh of the "Latest" record preview
    } catch (err) {
      setRecordError(err.response?.data?.message || 'Failed to save record. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
              <span>📋</span> Medical History &amp; Treatment Records
            </div>
            
            {loadingHistory ? (
              <div className="doc-medical-loading">Loading medical history...</div>
            ) : treatments.length === 0 ? (
              <div className="doc-medical-empty">
                <span>🩺</span>
                <p>No medical records available yet.</p>
                <small>Medical history will appear here once records are added.</small>
              </div>
            ) : (
              <div className="doc-treatment-list">
                {/* Only show the latest treatment */}
                {(() => {
                  const latest = [...treatments].sort((a, b) => {
                    const dateDiff = new Date(b.treatmentDate) - new Date(a.treatmentDate);
                    if (dateDiff !== 0) return dateDiff;
                    return (b.id || 0) - (a.id || 0);
                  })[0];
                  return (
                    <div className="doc-treatment-item latest">
                      <div className="doc-treatment-meta">
                        <span className="doc-treatment-date">{new Date(latest.treatmentDate).toLocaleDateString('en-GB')}</span>
                        <span className="doc-treatment-doc">By {latest.doctorName}</span>
                      </div>
                      <div className="doc-treatment-main">
                        <strong>{latest.diagnosis}</strong>
                        {latest.treatmentNotes && <p>{latest.treatmentNotes}</p>}
                      </div>
                    </div>
                  );
                })()}
                
                <button 
                  className="btn btn-dark-blue"
                  onClick={() => navigate('/dashboard/pet-medical-record', { state: { pet } })}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  View Medical Records
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Vaccinations */}
          <div className="upcoming-vax-section">
            <div className="vax-title">💉 Upcoming Vaccinations</div>
            <p className="vax-info">No upcoming vaccinations scheduled for this pet.</p>
          </div>

          {/* Actions */}
          <div className="pet-detail-actions">
            <button className="btn btn-white" onClick={onClose} style={{ flex: 1 }}>
              Close
            </button>
            <button className="btn btn-teal" onClick={openRecordModal} style={{ flex: 1.5 }}>
              + Add Medical Record
            </button>
          </div>

          <p className="pet-detail-registered">
            Registered on {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('en-GB') : '—'}
          </p>
        </div>
      </div>

      {/* Add Medical Record Modal */}
      {showRecordModal && (
        <div className="modal-overlay" onClick={closeRecordModal}>
          <div className="update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Medical Record</h2>
              <button className="close-btn" onClick={closeRecordModal}>×</button>
            </div>

            {recordSuccess ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Record Saved!</h3>
                <p style={{ color: 'var(--text-muted, #888)', marginBottom: '1.5rem' }}>
                  Medical record has been added for <strong>{pet.name}</strong>.
                </p>
                <button className="primary-btn" onClick={closeRecordModal}>Done</button>
              </div>
            ) : (
              <form className="update-form" onSubmit={submitRecord}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Visit Date <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="date"
                      name="treatmentDate"
                      value={recordForm.treatmentDate}
                      onChange={handleRecordChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pet</label>
                    <input type="text" value={`${pet.name} (${pet.species})`} readOnly />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Diagnosis <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={recordForm.diagnosis}
                    onChange={handleRecordChange}
                    placeholder="e.g. Mild fever, Ear infection"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Doctor Name <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      name="doctorName"
                      value={recordForm.doctorName}
                      onChange={handleRecordChange}
                      placeholder="e.g. Dr. Perera"
                    />
                  </div>
                  <div className="form-group">
                    <label>Doctor ID <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      name="doctorId"
                      value={recordForm.doctorId}
                      onChange={handleRecordChange}
                      placeholder="e.g. VET-001"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Treatment Notes</label>
                  <textarea
                    name="treatmentNotes"
                    rows="2"
                    value={recordForm.treatmentNotes}
                    onChange={handleRecordChange}
                    placeholder="e.g. Antibiotics prescribed for 5 days"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Prescriptions</label>
                  <textarea
                    name="prescriptions"
                    rows="2"
                    value={recordForm.prescriptions}
                    onChange={handleRecordChange}
                    placeholder="e.g. Amoxicillin 250mg twice daily"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Physical Observation</label>
                  <textarea
                    name="physicalObservation"
                    rows="2"
                    value={recordForm.physicalObservation}
                    onChange={handleRecordChange}
                    placeholder="e.g. Temperature 39.2°C, mild lethargy"
                  />
                </div>

                {recordError && (
                  <div className="error-box">{recordError}</div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn btn-white" onClick={closeRecordModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-teal" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPetDetail;
