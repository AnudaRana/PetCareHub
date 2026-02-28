// File: src/components/PetCard.jsx
import React from 'react';
import { API_BASE_URL } from '../services/petService';
import '../styles/PetCard.css';

const SPECIES_EMOJI = {
    Dog: '🐕',
    Cat: '🐈',
    Bird: '🐦',
    Rabbit: '🐇',
    Fish: '🐟',
};

const GENDER_DISPLAY = {
    MALE: { label: '♂ Male', icon: '♂' },
    FEMALE: { label: '♀ Female', icon: '♀' },
    UNKNOWN: { label: '? Unknown', icon: '?' },
};

const PetCard = ({ pet, onSelect }) => {
    const speciesEmoji = SPECIES_EMOJI[pet.species] || '🐾';
    const gender = GENDER_DISPLAY[pet.gender] || GENDER_DISPLAY.UNKNOWN;

    return (
        <div className="pet-card-container" onClick={() => onSelect(pet)}>
            {/* Top dark blue banner with the gradient */}
            <div className="pet-card-banner">
                {pet.petImagePath ? (
                    <img
                        className="pet-card-avatar-img"
                        src={`${API_BASE_URL}/${pet.petImagePath}`}
                        alt={pet.name}
                    />
                ) : (
                    <div className="pet-card-avatar">
                        <span style={{ fontSize: 24 }}>{speciesEmoji}</span>
                    </div>
                )}
            </div>

            <div className="pet-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 className="pet-card-title">{pet.name}</h3>
                        <p className="pet-card-subtitle">{pet.breed || 'Mixed breed'}</p>
                    </div>
                    {/* Status pills removed as per instructions */}
                </div>
            </div>

            <div className="pet-card-footer">
                <span className="pet-card-gender">{gender.label}</span>
                <span className="pet-card-species">{pet.species}</span>
            </div>
        </div>
    );
};

export default PetCard;
