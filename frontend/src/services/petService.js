import axios from 'axios';

/** Empty string = same origin; Vite dev server proxies /api to backend (see vite.config.js). */
export const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL != null
    ? import.meta.env.VITE_API_BASE_URL
    : '';

/**
 * Robust helper to build pet image URLs.
 */
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    let normalizedPath = path.replace(/^[\\\/]+/, '').replace(/\\/g, '/');

    // Ensure the path is correctly prefixed if missing but expected by backend mapping
    if (!normalizedPath.startsWith('uploads/') && !normalizedPath.startsWith('api/')) {
        // If the backend stores only the filename, we need to prepend uploads/
        normalizedPath = `uploads/${normalizedPath}`;
    }

    // If API_BASE_URL exists, use it. Otherwise, use relative path so Vite proxy handles it.
    return API_BASE_URL ? `${API_BASE_URL}/${normalizedPath}` : `/${normalizedPath}`;
};

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
    return response?.data ?? response;
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
    return response?.data ?? response;
};

/**
 * Get all pets in the system (staff/doctor view)
 */
export const getAllPets = async () => {
    const response = await axios.get(`${API_BASE_URL}${API_BASE}/all`, {
        headers: getAuthHeaders()
    });
    return response?.data ?? response;
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
