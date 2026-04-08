import React from 'react';
import { getImageUrl } from '../../../../services/petService';
import '../../../../styles/PetCard.css';

const GENDER_DISPLAY = {
    MALE: { label: '♂ Male', icon: '♂' },
    FEMALE: { label: '♀ Female', icon: '♀' },
    UNKNOWN: { label: '? Unknown', icon: '?' },
};

const PetCard = ({ pet, onSelect }) => {
    const gender = GENDER_DISPLAY[pet.gender] || GENDER_DISPLAY.UNKNOWN;
    const imageUrl = getImageUrl(pet.petImagePath);

    return (
        <div className="pet-card-container-v2" onClick={() => onSelect(pet)}>
            <div className="pet-card-banner-v2">
                <div className="pet-card-image-ring">
                    {imageUrl ? (
                        <img
                            className="pet-card-avatar-v2"
                            src={imageUrl}
                            alt={pet.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className="pet-card-placeholder-v2" style={{ display: imageUrl ? 'none' : 'flex' }}>
                        <span className="placeholder-icon">🐾</span>
                    </div>
                </div>
            </div>

            <div className="pet-card-body-v2">
                <h3 className="pet-card-name-v2">{pet.name}</h3>
                <p className="pet-card-breed-v2">{pet.breed || 'Companion'}</p>
            </div>
        </div>
    );
};

export default PetCard;
