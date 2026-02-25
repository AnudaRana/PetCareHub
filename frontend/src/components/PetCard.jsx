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
        <article className="pet-card" onClick={() => onSelect(pet)} aria-label={`View ${pet.name}'s profile`}>
            <div className="pet-card-image-wrapper">
                {pet.petImagePath ? (
                    <img
                        className="pet-card-image"
                        src={`${API_BASE_URL}/${pet.petImagePath}`}
                        alt={pet.name}
                    />
                ) : (
                    <span className="pet-card-placeholder">{speciesEmoji}</span>
                )}
                <span className="pet-card-species-tag">{pet.species}</span>
            </div>

            <div className="pet-card-body">
                <h3 className="pet-card-name">{pet.name}</h3>
                <p className="pet-card-breed">{pet.breed || 'Mixed breed'}</p>

                <div className="pet-card-footer">
                    <span className="pet-card-gender">{gender.label}</span>
                    <button className="pet-card-view-btn">View Profile →</button>
                </div>
            </div>
        </article>
    );
};

export default PetCard;
