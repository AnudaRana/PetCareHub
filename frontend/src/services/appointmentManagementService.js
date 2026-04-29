import axios from 'axios';

const APPOINTMENT_TYPES_API = '/api/appointment-types';
const DEFAULT_TIME_SLOTS_API = '/api/default-time-slots';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Appointment Types ---

export const getAppointmentTypes = async () => {
    const response = await axios.get(APPOINTMENT_TYPES_API, { headers: getAuthHeaders() });
    return response.data;
};

export const addAppointmentType = async (payload) => {
    const response = await axios.post(APPOINTMENT_TYPES_API, payload, { headers: getAuthHeaders() });
    return response.data;
};

export const updateAppointmentType = async (id, payload) => {
    const response = await axios.put(`${APPOINTMENT_TYPES_API}/${id}`, payload, { headers: getAuthHeaders() });
    return response.data;
};

export const deleteAppointmentType = async (id) => {
    const response = await axios.delete(`${APPOINTMENT_TYPES_API}/${id}`, { headers: getAuthHeaders() });
    return response.data;
};

// --- Default Time Slots ---

export const getDefaultTimeSlots = async () => {
    const response = await axios.get(DEFAULT_TIME_SLOTS_API, { headers: getAuthHeaders() });
    return response.data;
};

export const addDefaultTimeSlot = async (payload) => {
    const response = await axios.post(DEFAULT_TIME_SLOTS_API, payload, { headers: getAuthHeaders() });
    return response.data;
};

export const updateDefaultTimeSlot = async (id, payload) => {
    const response = await axios.put(`${DEFAULT_TIME_SLOTS_API}/${id}`, payload, { headers: getAuthHeaders() });
    return response.data;
};

export const deleteDefaultTimeSlot = async (id) => {
    const response = await axios.delete(`${DEFAULT_TIME_SLOTS_API}/${id}`, { headers: getAuthHeaders() });
    return response.data;
};
