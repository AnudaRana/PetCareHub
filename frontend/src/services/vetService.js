import axios from 'axios';

const API_BASE = '/api/users/vets';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all vets (users with VET role from user_roles table)
 */
export const getAllVets = async () => {
    const response = await axios.get(API_BASE, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Get a specific vet by ID
 */
export const getVetById = async (vetId) => {
    const response = await axios.get(`${API_BASE}/${vetId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};
