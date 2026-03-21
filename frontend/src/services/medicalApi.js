import axios from "axios";

const API_BASE = "http://localhost:8080/api/medical-records"; // replace with your backend URL

export const getTreatmentsByPetId = async (petId) => {
  const res = await axios.get(`${API_BASE}/treatments/pet/${petId}`);
  return res.data;
};

export const addTreatment = async (petId, treatment) => {
  const res = await axios.post(`${API_BASE}/treatments/pet/${petId}`, treatment);
  return res.data;
};