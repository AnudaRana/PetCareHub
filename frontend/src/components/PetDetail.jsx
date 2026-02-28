import React, { useState } from 'react';
import { API_BASE_URL } from '../services/petService';
import '../styles/PetDetail.css';
import EditPetForm from './EditPetForm';

const SPECIES_EMOJI = { Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇', Fish: '🐟' };

const PetDetail = ({ pet, onClose, onUpdateSuccess, userId }) => {
    const [isEditing, setIsEditing] = useState(false);

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

                    <div className="upcoming-vax-section">
                        <div className="vax-title">
                            Upcoming Vaccinations
                        </div>
                        <p className="vax-info">
                            If you have any upcoming vaccinations they will be displayed here
                        </p>
                    </div>

                    <div className="pet-detail-actions">
                        <button
                            className="pet-detail-btn primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                        <button className="pet-detail-btn secondary">
                            View Medical Records
                        </button>
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
