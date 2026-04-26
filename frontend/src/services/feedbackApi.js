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

export const getFeedbackById = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addStaffReply = async (id, reply) => {
    try {
        const response = await axios.post(`${BASE_URL}/${id}/reply`, reply, { 
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } 
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPublicFeedbacks = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/public`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getFeedbacksByProduct = async (productId) => {
    try {
        const response = await axios.get(`${BASE_URL}/product/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
