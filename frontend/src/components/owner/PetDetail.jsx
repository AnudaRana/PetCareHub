import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/petService';
import { getTreatmentsByPetId } from '../../services/medicalApi';
import '../../styles/PetDetail.css';
import EditPetForm from './EditPetForm';

const SPECIES_EMOJI = { Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇', Fish: '🐟' };

const PetDetail = ({ pet, onClose, onUpdateSuccess, userId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!pet?.petId) return;
        getTreatmentsByPetId(pet.petId)
            .then((data) => {
                const mapped = (Array.isArray(data) ? data : []).map((t) => ({
                    id: t.id,
                    date: t.treatmentDate || '',
                    diagnosis: t.diagnosis || '',
                    notes: t.treatmentNotes || '',
                }));
                setMedicalRecords(mapped);
            })
            .catch((err) => console.error('Failed to load medical records:', err));
    }, [pet]);

    if (!pet) return null;

    if (isEditing) {
        return (
            <EditPetForm
                pet={pet}
                onClose={() => setIsEditing(false)}
                onUpdateSuccess={onUpdateSuccess}
                userId={userId}
            />
        );
    }

    const emoji = SPECIES_EMOJI[pet.species] || '🐾';

    const calcAge = (dob) => {
        if (!dob) return 'Unknown';
        const today = new Date();
        const birth = new Date(dob);
        const years = today.getFullYear() - birth.getFullYear();
        const months = today.getMonth() - birth.getMonth();
        if (years === 0) return `${months < 0 ? 0 : months} months`;
        return `${years} year${years > 1 ? 's' : ''}`;
    };

    return (
        <div
            className="pet-detail-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`${pet.name}'s profile`}
        >
            <div className="pet-detail-panel" onClick={(e) => e.stopPropagation()}>
                <div className="pet-detail-header">
                    {pet.petImagePath ? (
                        <img
                            src={`${API_BASE_URL}/${pet.petImagePath}`}
                            alt={pet.name}
                        />
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
                            <div className="pet-detail-field-label">Owner</div>
                            <div className="pet-detail-field-value">{pet.ownerName || '—'}</div>
                        </div>

                        {pet.knownIllnesses && (
                            <div className="pet-detail-field full-width pet-detail-illnesses">
                                <div className="pet-detail-field-label">Known Illnesses / Conditions</div>
                                <div className="pet-detail-field-value">{pet.knownIllnesses}</div>
                            </div>
                        )}
                    </div>

                    <div className="pet-detail-medical-section">
                        <h3 className="pet-detail-field-label" style={{ marginBottom: '8px' }}>Medical History &amp; Treatment Records</h3>
                        {medicalRecords.length === 0 ? (
                            <p className="pet-detail-field-value" style={{ fontStyle: 'italic', opacity: 0.6 }}>No medical records available yet.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {medicalRecords.map((record) => (
                                    <li key={record.id} style={{ marginBottom: '10px', padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', borderLeft: '3px solid #7c6ef7' }}>
                                        <div className="pet-detail-field-label">{record.date ? new Date(record.date).toLocaleDateString('en-GB') : '—'}</div>
                                        {record.diagnosis && <div className="pet-detail-field-value"><strong>Diagnosis:</strong> {record.diagnosis}</div>}
                                        {record.notes && <div className="pet-detail-field-value"><strong>Notes:</strong> {record.notes}</div>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="pet-detail-actions">
                        <button
                            className="pet-detail-btn primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                        {medicalRecords.length > 0 && (
                            <button
                                className="pet-detail-btn secondary"
                                onClick={() => navigate('/pet-medical-record', { state: { pet } })}
                            >
                                View All Medical Records
                            </button>
                        )}
                    </div>

                    <p className="pet-detail-registered">
                        Registered on {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('en-GB') : '—'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PetDetail;
