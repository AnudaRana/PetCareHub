import axios from 'axios';

const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL != null
  ? import.meta.env.VITE_API_BASE_URL
  : '';

const BASE_URL = `${API_BASE_URL}/api/feedbacks`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const submitFeedback = async (feedbackData) => {
    try {
        const response = await axios.post(BASE_URL, feedbackData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllFeedbacks = async () => {
    try {
        const response = await axios.get(BASE_URL, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getFeedbackByAppointment = async (appointmentId) => {
    try {
        const response = await axios.get(`${BASE_URL}/appointment/${appointmentId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error;
    }
};
