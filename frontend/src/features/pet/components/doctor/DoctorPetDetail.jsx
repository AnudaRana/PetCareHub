import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl, API_BASE_URL } from '../../../../services/petService';
import { getTreatmentsByPetId } from '../../../../services/medicalApi';
import { useAuth } from '../../../auth/contexts/AuthContext';
import '../../../../styles/PetDetail.css';
import '../../../../styles/medical.css';

const calcAge = (dob) => {
    if (!dob) return 'Unknown';
    const today = new Date();
    const birth = new Date(dob);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }
    if (years === 0) return `${months} months`;
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
    const imageUrl = getImageUrl(pet.petImagePath);

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
            fetchHistory();
        } catch (err) {
            setRecordError(err.response?.data?.message || 'Failed to save record. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pet-detail-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="pet-detail-panel doc-pet-detail-panel" onClick={e => e.stopPropagation()}>
                <header className="pet-detail-header">
                    {imageUrl ? (
                        <img src={imageUrl} alt={pet.name} />
                    ) : (
                        <div className="pet-detail-avatar-fallback">
                            <span className="placeholder-icon">🐾</span>
                        </div>
                    )}
                    <div className="doc-sidebar-role-badge" style={{ position: 'absolute', top: '20px', left: '20px', margin: 0, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                        READ-ONLY ACCESS
                    </div>
                    <button className="pet-detail-back-btn" onClick={onClose} aria-label="Close">✕</button>
                </header>

                <div className="pet-detail-body">
                    <div className="pet-detail-title-row">
                        <h2 className="pet-detail-name">{pet.name}</h2>
                        <span className="pet-detail-species-badge">{pet.species.toLowerCase()}</span>
                    </div>

                    <div className="doc-owner-info-card">
                        <div className="doc-owner-info-label">Primary Caretaker</div>
                        <div className="doc-owner-info-value">{pet.ownerName || 'Unknown Owner'}</div>
                        <div className="doc-owner-info-sub">Responsible party for this patient</div>
                    </div>

                    <div className="pet-detail-grid">
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Breed</div>
                            <div className="pet-detail-field-value">{pet.breed || 'Companion'}</div>
                        </div>
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Gender</div>
                            <div className="pet-detail-field-value">
                                {pet.gender === 'MALE' ? '♂ Male' : pet.gender === 'FEMALE' ? '♀ Female' : '? Mixed'}
                            </div>
                        </div>
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Clinical Age</div>
                            <div className="pet-detail-field-value">{calcAge(pet.dateOfBirth)}</div>
                        </div>
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Visit Weight</div>
                            <div className="pet-detail-field-value">{pet.weight ? `${pet.weight} kg` : 'N/A'}</div>
                        </div>
                        <div className="pet-detail-field full-width">
                            <div className="pet-detail-field-label">Date of Birth</div>
                            <div className="pet-detail-field-value">
                                {pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                            </div>
                        </div>
                        {pet.knownIllnesses && (
                            <div className="pet-detail-field full-width pet-detail-illnesses" style={{ background: 'rgba(255,59,48,0.05)', borderLeft: '4px solid #ff3b30' }}>
                                <div className="pet-detail-field-label" style={{ color: '#ff3b30' }}>Medical Alerts</div>
                                <div className="pet-detail-field-value">{pet.knownIllnesses}</div>
                            </div>
                        )}
                    </div>

                    <div className="doc-medical-section">
                        <div className="doc-medical-title">
                            <span>📋</span> LATEST CLINICAL RECORD
                        </div>
                        {loadingHistory ? (
                            <div className="doc-medical-loading">Accessing clinic database...</div>
                        ) : treatments.length === 0 ? (
                            <div className="doc-medical-empty">
                                <span>🩺</span>
                                <p>No records found.</p>
                                <small>Add a new treatment record to track health status.</small>
                            </div>
                        ) : (
                            <div className="doc-treatment-list">
                                {(() => {
                                    const latest = [...treatments].sort((a,b) => new Date(b.treatmentDate) - new Date(a.treatmentDate))[0];
                                    return (
                                        <div className="doc-treatment-item">
                                            <div className="doc-treatment-meta">
                                                <span className="doc-treatment-date">{new Date(latest.treatmentDate).toLocaleDateString('en-GB')}</span>
                                                <span className="doc-treatment-doc">Dr. {latest.doctorName}</span>
                                            </div>
                                            <div className="doc-treatment-main">
                                                <strong>{latest.diagnosis}</strong>
                                                <p>{latest.treatmentNotes}</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <button 
                                    className="btn btn-dark-blue"
                                    onClick={() => navigate('/dashboard/pet-medical-record', { state: { pet } })}
                                    style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                                >
                                    📊 Expand Medical History
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pet-detail-actions">
                        <button className="btn btn-white" onClick={onClose} style={{ flex: 1 }}>Close</button>
                        <button className="btn btn-teal" onClick={openRecordModal} style={{ flex: 1.5 }}>+ Add Diagnosis</button>
                    </div>

                    <p className="pet-detail-registered">
                        Database footprint since {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('en-GB') : '—'}
                    </p>
                </div>
            </div>

            {showRecordModal && (
                <div className="modal-overlay" onClick={closeRecordModal}>
                    <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Clinical Record</h2>
                            <button className="close-btn" onClick={closeRecordModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            {recordSuccess ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                                    <h3>Record Finalized</h3>
                                    <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>Medical documentation for <strong>{pet.name}</strong> was saved.</p>
                                    <button className="btn btn-teal" onClick={closeRecordModal}>Return to Profile</button>
                                </div>
                            ) : (
                                <form className="premium-form" onSubmit={submitRecord}>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div className="form-group">
                                            <label>Visit Date</label>
                                            <input type="date" name="treatmentDate" className="form-input" value={recordForm.treatmentDate} onChange={handleRecordChange} max={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div className="form-group">
                                            <label>Patient ID</label>
                                            <input type="text" className="form-input" value={`#${pet.petId} - ${pet.name}`} disabled />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label>Primary Diagnosis</label>
                                        <input type="text" name="diagnosis" className="form-input" value={recordForm.diagnosis} onChange={handleRecordChange} placeholder="e.g. Acute Gastritis" required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label>Treatment Plan & Notes</label>
                                        <textarea name="treatmentNotes" className="form-input" rows="3" value={recordForm.treatmentNotes} onChange={handleRecordChange} placeholder="Detailed clinical observations..." />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '24px' }}>
                                        <label>Prescriptions</label>
                                        <textarea name="prescriptions" className="form-input" rows="2" value={recordForm.prescriptions} onChange={handleRecordChange} placeholder="Medications, dosage, frequency..." />
                                    </div>
                                    {recordError && <div className="error-banner" style={{ marginBottom: '16px' }}>{recordError}</div>}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="button" className="btn btn-white" onClick={closeRecordModal} style={{ flex: 1 }}>Discard</button>
                                        <button type="submit" className="btn btn-teal" disabled={submitting} style={{ flex: 2 }}>{submitting ? 'Archiving...' : '🔒 Save Clinical Record'}</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPetDetail;
