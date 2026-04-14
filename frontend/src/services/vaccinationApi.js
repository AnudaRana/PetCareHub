import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch all vaccinations for a specific pet
 * @param {number} petId - The pet ID
 * @returns {Promise<Array>} Array of vaccination records
 */
export const getVaccinationsByPetId = async (petId) => {
  const response = await axios.get(`${API_BASE_URL}/api/medical-records/vaccinations/pet/${petId}`, {
      headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Add a new vaccination record
 * @param {number} petId - The pet ID
 * @param {Object} vaccinationData - Vaccination data
 * @returns {Promise<Object>} Created vaccination record
 */
export const addVaccinationToPet = async (petId, vaccinationData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/medical-records/vaccinations/pet/${petId}`,
    vaccinationData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Fetch all reminders for the currently authenticated user
 * @returns {Promise<Array>} Array of reminder records
 */
export const getReminders = async (userId = null) => {
  const params = userId ? `?userId=${userId}` : '';
  const response = await axios.get(`${API_BASE_URL}/api/reminders${params}`, {
      headers: getAuthHeaders()
  });
  return response.data;
};

export default {
  getVaccinationsByPetId,
  addVaccinationToPet,
  getReminders,
};
