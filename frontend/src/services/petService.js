import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8081';

const API_BASE = '/api/pets';

// No JWT headers needed as requested
const noAuthHeader = () => ({});

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Register a new pet (multipart/form-data with image and ownerId)
 */
export const registerPet = async (formData) => {
    // formData must contain 'ownerId'
    const response = await axios.post(`${API_BASE_URL}${API_BASE}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
        },
    });
    return response.data;
};

/**
 * Get all pets for a specific ownerId
 */
export const getPetsByOwner = async (ownerId) => {
    const response = await axios.get(`${API_BASE_URL}${API_BASE}`, {
        params: { ownerId },
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Get a specific pet by ID (requires ownerId for verification)
 */
export const getPetById = async (petId, ownerId) => {
    const response = await axios.get(`${API_BASE_URL}${API_BASE}/${petId}`, {
        params: { ownerId },
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Search pets by name for a specific ownerId
 */
export const searchPetsByOwner = async (ownerId, name) => {
    const response = await axios.get(`${API_BASE_URL}${API_BASE}/search`, {
        params: { ownerId, name },
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Update an existing pet profile
 */
export const updatePet = async (petId, formData) => {
    const response = await axios.put(`${API_BASE_URL}${API_BASE}/${petId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
        },
    });
    return response.data;
};
