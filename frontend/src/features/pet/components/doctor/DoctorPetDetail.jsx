import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../../services/petService';
import { getTreatmentsByPetId, createTreatment } from '../../../../services/medicalApi';
import { getVaccinationsByPetId, addVaccinationToPet } from '../../../../services/vaccinationApi';
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

const INITIAL_VACCINE_FORM = {
    vaccinationDate: '',
    vaccinationName: '',
    dose: '',
    description: '',
    doctorName: '',
    doctorId: '',
    dueDate: '',
};

const DoctorPetDetail = ({ pet, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Treatment Record States
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [recordForm, setRecordForm] = useState(INITIAL_RECORD_FORM);
    const [recordError, setRecordError] = useState('');
    const [recordSuccess, setRecordSuccess] = useState(false);

    // Vaccination Record States
    const [showVaccineModal, setShowVaccineModal] = useState(false);
    const [vaccineForm, setVaccineForm] = useState(INITIAL_VACCINE_FORM);
    const [vaccineError, setVaccineError] = useState('');
    const [vaccineSuccess, setVaccineSuccess] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [treatments, setTreatments] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (pet?.petId) {
            fetchHistory();
        }
    }, [pet]);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const [treatData, vacData] = await Promise.all([
                getTreatmentsByPetId(pet.petId),
                getVaccinationsByPetId(pet.petId)
            ]);
            setTreatments(treatData || []);
            setVaccinations(vacData || []);
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

    const openVaccineModal = () => {
        setVaccineForm({
            ...INITIAL_VACCINE_FORM,
            doctorName: user?.fullName || '',
            doctorId: `VET-${user?.userId || ''}`,
            vaccinationDate: new Date().toISOString().split('T')[0]
        });
        setVaccineError('');
        setVaccineSuccess(false);
        setShowVaccineModal(true);
    };

    const closeVaccineModal = () => {
        setShowVaccineModal(false);
        setVaccineForm(INITIAL_VACCINE_FORM);
        setVaccineError('');
        setVaccineSuccess(false);
    };

    const handleVaccineChange = (e) => {
        const { name, value } = e.target;
        setVaccineForm((prev) => ({ ...prev, [name]: value }));
        setVaccineError('');
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
            await createTreatment(
                pet.petId,
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

    const submitVaccine = async (e) => {
        e.preventDefault();
        if (!vaccineForm.vaccinationDate) {
            setVaccineError('Vaccination date is required.');
            return;
        }
        if (!vaccineForm.vaccinationName.trim()) {
            setVaccineError('Vaccine name is required.');
            return;
        }
        if (!vaccineForm.dose.trim()) {
            setVaccineError('Dose information is required.');
            return;
        }

        setSubmitting(true);
        setVaccineError('');

        try {
            await addVaccinationToPet(
                pet.petId,
                {
                    vaccinationDate: vaccineForm.vaccinationDate,
                    vaccinationName: vaccineForm.vaccinationName,
                    dose: vaccineForm.dose,
                    description: vaccineForm.description,
                    doctorName: vaccineForm.doctorName,
                    doctorId: vaccineForm.doctorId,
                    dueDate: vaccineForm.dueDate || null,
                }
            );
            setVaccineSuccess(true);
            fetchHistory();
        } catch (err) {
            setVaccineError(err.response?.data?.message || 'Failed to save vaccine. Please try again.');
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
                        <div className="doc-medical-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="doc-medical-column">
                                <div className="doc-medical-title">
                                    <span>📋</span> LATEST CLINICAL ENTRY
                                </div>
                                {loadingHistory ? (
                                    <div className="doc-medical-loading">Syncing...</div>
                                ) : treatments.length === 0 ? (
                                    <div className="doc-medical-empty">
                                        <span>🩺</span>
                                        <p>No treatment records found.</p>
                                    </div>
                                ) : (
                                    <div className="doc-treatment-item">
                                        <div className="doc-treatment-meta">
                                            <span className="doc-treatment-date">{new Date([...treatments].sort((a, b) => new Date(b.treatmentDate) - new Date(a.treatmentDate))[0].treatmentDate).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        <div className="doc-treatment-main">
                                            <strong>{[...treatments].sort((a, b) => new Date(b.treatmentDate) - new Date(a.treatmentDate))[0].diagnosis}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="doc-medical-column">
                                <div className="doc-medical-title">
                                    <span>💉</span> LATEST VACCINATION
                                </div>
                                {loadingHistory ? (
                                    <div className="doc-medical-loading">Syncing...</div>
                                ) : vaccinations.length === 0 ? (
                                    <div className="doc-medical-empty">
                                        <span>💉</span>
                                        <p>No vaccine records found.</p>
                                    </div>
                                ) : (
                                    <div className="doc-treatment-item">
                                        <div className="doc-treatment-meta">
                                            <span className="doc-treatment-date">{new Date([...vaccinations].sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate))[0].vaccinationDate).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        <div className="doc-treatment-main">
                                            <strong>{[...vaccinations].sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate))[0].vaccinationName}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            className="btn btn-dark-blue"
                            onClick={() => navigate('/dashboard/pet-medical-record', { state: { pet } })}
                            style={{ width: '100%', marginTop: '16px', padding: '12px' }}
                        >
                            📊 Access Comprehensive Medical Vault
                        </button>
                    </div>

                    <div className="pet-detail-actions" style={{ gap: '10px' }}>
                        <button className="btn btn-white" onClick={onClose} style={{ flex: 1 }}>Close</button>
                        <button className="btn btn-teal" onClick={openRecordModal} style={{ flex: 1.5 }}>+ Add Diagnosis</button>
                        <button className="btn btn-teal" onClick={openVaccineModal} style={{ flex: 1.5 }}>+ Add Vaccine</button>
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

            {showVaccineModal && (
                <div className="modal-overlay" onClick={closeVaccineModal}>
                    <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ color: '#6366f1' }}>Add Vaccination Record</h2>
                            <button className="close-btn" onClick={closeVaccineModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            {vaccineSuccess ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💉</div>
                                    <h3>Vaccination Logged</h3>
                                    <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>Immunization record for <strong>{pet.name}</strong> was saved.</p>
                                    <button className="btn btn-teal" onClick={closeVaccineModal}>Return to Profile</button>
                                </div>
                            ) : (
                                <form className="premium-form" onSubmit={submitVaccine}>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div className="form-group">
                                            <label>Vaccination Date</label>
                                            <input type="date" name="vaccinationDate" className="form-input" value={vaccineForm.vaccinationDate} onChange={handleVaccineChange} max={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div className="form-group">
                                            <label>Next Due Date</label>
                                            <input type="date" name="dueDate" className="form-input" value={vaccineForm.dueDate} onChange={handleVaccineChange} min={new Date().toISOString().split('T')[0]} />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div className="form-group">
                                            <label>Vaccine Name</label>
                                            <input type="text" name="vaccinationName" className="form-input" value={vaccineForm.vaccinationName} onChange={handleVaccineChange} placeholder="e.g. Rabies" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Dosage</label>
                                            <input type="text" name="dose" className="form-input" value={vaccineForm.dose} onChange={handleVaccineChange} placeholder="e.g. 1.0 ml" required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '24px' }}>
                                        <label>Administration Notes</label>
                                        <textarea name="description" className="form-input" rows="3" value={vaccineForm.description} onChange={handleVaccineChange} placeholder="Observations, batch number, reaction..." />
                                    </div>
                                    {vaccineError && <div className="error-banner" style={{ marginBottom: '16px' }}>{vaccineError}</div>}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="button" className="btn btn-white" onClick={closeVaccineModal} style={{ flex: 1 }}>Discard</button>
                                        <button type="submit" className="btn btn-teal" disabled={submitting} style={{ flex: 2 }}>{submitting ? 'Archiving...' : '🔒 Save Vaccination'}</button>
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
