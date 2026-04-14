import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083';

/**
 * Fetch all medical treatments for a specific pet
 * @param {number} petId - The pet ID
 * @returns {Promise<Array>} Array of treatment records
 */
export const getTreatmentsByPetId = async (petId) => {
  const response = await axios.get(`${API_BASE_URL}/api/medical-records/treatments/pet/${petId}`);
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
    treatmentData
  );
  return response.data;
};

/**
 * Get treatment by ID
 * @param {number} treatmentId - The treatment ID
 * @returns {Promise<Object>} Treatment record
 */
export const getTreatmentById = async (treatmentId) => {
  const response = await axios.get(`${API_BASE_URL}/api/medical-records/treatments/${treatmentId}`);
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
    treatmentData
  );
  return response.data;
};

export default {
  getTreatmentsByPetId,
  createTreatment,
  addTreatmentToPet,
  getTreatmentById,
};
