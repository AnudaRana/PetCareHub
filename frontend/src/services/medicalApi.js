import axios from 'axios';

const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL != null
  ? import.meta.env.VITE_API_BASE_URL
  : '';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch all medical treatments for a specific pet
 * @param {number} petId - The pet ID
 * @returns {Promise<Array>} Array of treatment records
 */
export const getTreatmentsByPetId = async (petId) => {
  const response = await axios.get(`${API_BASE_URL}/api/medical-records/treatments/pet/${petId}`, {
      headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Create a new medical treatment record
 * @param {number} petId - The pet ID
 * @param {Object} treatmentData - Treatment data
 * @returns {Promise<Object>} Created treatment record
 */
export const createTreatment = async (petId, treatmentData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/medical-records/treatments/pet/${petId}`,
    treatmentData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get treatment by ID
 * @param {number} treatmentId - The treatment ID
 * @returns {Promise<Object>} Treatment record
 */
export const getTreatmentById = async (treatmentId) => {
  const response = await axios.get(`${API_BASE_URL}/api/medical-records/treatments/${treatmentId}`, {
      headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Add a new treatment to a pet (alias for createTreatment)
 * @param {number} petId - The pet ID
 * @param {Object} treatmentData - Treatment data
 * @returns {Promise<Object>} Created treatment record
 */
export const addTreatmentToPet = async (petId, treatmentData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/medical-records/treatments/pet/${petId}`,
    treatmentData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Delete a medical treatment record
 * @param {number} treatmentId - The treatment ID
 * @returns {Promise<void>}
 */
export const deleteTreatment = async (treatmentId) => {
  await axios.delete(`${API_BASE_URL}/api/medical-records/treatments/${treatmentId}`, {
    headers: getAuthHeaders()
  });
};

export default {
  getTreatmentsByPetId,
  createTreatment,
  addTreatmentToPet,
  getTreatmentById,
  deleteTreatment,
};
