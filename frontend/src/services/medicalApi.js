import axios from 'axios';
import { API_BASE_URL } from './petService';

const API_BASE = '/api/medical-records';

export const getTreatmentsByPetId = async (petId) => {
  const response = await axios.get(API_BASE_URL + API_BASE + '/treatments/pet/' + petId);
  return response.data;
};

export const addTreatmentToPet = async (petId, treatmentDto) => {
  const response = await axios.post(API_BASE_URL + API_BASE + '/treatments/pet/' + petId, treatmentDto);
  return response.data;
};
