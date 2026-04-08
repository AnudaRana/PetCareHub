import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../../services/petService';
import '../../../../styles/PetDetail.css';
import EditPetForm from './EditPetForm';


const PetDetail = ({ pet, onClose, onUpdateSuccess, userId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

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

    const imageUrl = getImageUrl(pet.petImagePath);

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
        >
            <div className="pet-detail-panel" onClick={(e) => e.stopPropagation()}>
                <header className="pet-detail-header">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={pet.name}
                        />
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
                        <span className="pet-detail-species-badge">{pet.species}</span>
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
                            <div className="pet-detail-field-label">Age</div>
                            <div className="pet-detail-field-value">{calcAge(pet.dateOfBirth)}</div>
                        </div>

                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Weight</div>
                            <div className="pet-detail-field-value">{pet.weight ? `${pet.weight} kg` : '—'}</div>
                        </div>

                        <div className="pet-detail-field full-width">
                            <div className="pet-detail-field-label">Date of Birth</div>
                            <div className="pet-detail-field-value">
                                {pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                            </div>
                        </div>

                        {pet.knownIllnesses && (
                            <div className="pet-detail-field full-width pet-detail-illnesses">
                                <div className="pet-detail-field-label">Medical Conditions</div>
                                <div className="pet-detail-field-value">{pet.knownIllnesses}</div>
                            </div>
                        )}
                    </div>

                    <div className="pet-detail-actions">
                        <button
                            className="btn btn-teal"
                            onClick={() => setIsEditing(true)}
                            style={{ flex: 1, padding: '14px' }}
                        >
                            ✏️ Edit Profile
                        </button>
                        <button 
                            className="btn btn-dark-blue"
                            onClick={() => navigate('/dashboard/pet-medical-record', { state: { pet } })}
                            style={{ flex: 1, padding: '14px' }}
                        >
                            📊 Records
                        </button>
                    </div>

                    <p className="pet-detail-registered">
                        Profile created on {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('en-GB') : '—'}
                    </p>
                </div>
            </div>
        </div>

    );
};

export default PetDetail;
