// File: src/services/petService.js
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8081';

const API_BASE = '/api/pets';

// No JWT headers needed as requested
const noAuthHeader = () => ({});

/**
 * Register a new pet (multipart/form-data with image and ownerId)
 */
export const registerPet = async (formData) => {
    // formData must contain 'ownerId'
    const response = await axios.post(`${API_BASE_URL}${API_BASE}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get all pets for a specific ownerId
 */
export const getPetsByOwner = async (ownerId) => {
    const response = await axios.get(`${API_BASE_URL}${API_BASE}`, {
        params: { ownerId }
    });
    return response.data;
};

/**
 * Get a specific pet by ID (requires ownerId for verification)
 */
export const getPetById = async (petId, ownerId) => {
    const response = await axios.get(`${API_BASE_URL}${API_BASE}/${petId}`, {
        params: { ownerId }
    });
    return response.data;
};

/**
 * Search pets by name for a specific ownerId
 */
export const searchPetsByOwner = async (ownerId, name) => {
    const response = await axios.get(`${API_BASE_URL}${API_BASE}/search`, {
        params: { ownerId, name }
    });
    return response.data;
};
