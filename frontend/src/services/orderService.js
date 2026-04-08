import axios from 'axios';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getOwnerOrders = async (userId) => {
    return await axios.get(`/api/orders/owner/${userId}`, {
        headers: getAuthHeaders()
    });
};

export const getAllOrders = async () => {
    return await axios.get('/api/orders', {
        headers: getAuthHeaders()
    });
};

export const getPendingOrders = async () => {
    return await axios.get('/api/orders/pending', {
        headers: getAuthHeaders()
    });
};

export const getOrderById = async (orderId) => {
    return await axios.get(`/api/orders/${orderId}`, {
        headers: getAuthHeaders()
    });
};

export const updateOrderStatus = async (orderId, status) => {
    return await axios.put(`/api/orders/${orderId}/status`, { status }, {
        headers: getAuthHeaders()
    });
};

export const cancelOrder = async (orderId) => {
    return await axios.post(`/api/orders/${orderId}/cancel`, {}, {
        headers: getAuthHeaders()
    });
};

export const generateDummyOrders = async () => {
    return await axios.post('/api/orders/generate-dummy', {}, {
        headers: getAuthHeaders()
    });
};