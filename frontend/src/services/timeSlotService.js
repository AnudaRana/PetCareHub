import axios from 'axios';

const API_BASE = '/api/doctor-slots';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch all available time slots for a specific vet.
 * Used by the appointment booking form when a doctor is selected.
 */
export const getSlotsByVet = async (vetId) => {
    const response = await axios.get(`${API_BASE}/vet/${vetId}`, {
        headers: getAuthHeaders(),
    });
    return response.data; // returns DoctorTimeSlotResponse[]
};

/**
 * Fetch the calling vet's own time slots.
 * Used by the vet dashboard Manage Time Slots page.
 */
export const getMySlots = async () => {
    const response = await axios.get(`${API_BASE}/mine`, {
        headers: getAuthHeaders(),
    });
    return response.data; // returns DoctorTimeSlotResponse[]
};

/**
 * Add a new time slot for the calling vet.
 * @param {Object} payload - { timeSlot: string, label?: string }
 */
export const addSlot = async (payload) => {
    const response = await axios.post(API_BASE, payload, {
        headers: getAuthHeaders(),
    });
    return response.data; // returns saved DoctorTimeSlotResponse
};

/**
 * Update an existing time slot by its ID (must belong to the calling vet).
 * @param {number} id - slot record ID
 * @param {Object} payload - { timeSlot: string, label?: string }
 */
export const updateSlot = async (id, payload) => {
    const response = await axios.put(`${API_BASE}/${id}`, payload, {
        headers: getAuthHeaders(),
    });
    return response.data; // returns updated DoctorTimeSlotResponse
};

/**
 * Delete a time slot by ID (must belong to the calling vet).
 * @param {number} id - slot record ID
 */
export const deleteSlot = async (id) => {
    const response = await axios.delete(`${API_BASE}/${id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};
