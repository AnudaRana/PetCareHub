import { httpClient } from '../../cart/services/httpClient';

const API_BASE = '/api/staff/receipts';

export const receiptService = {
  getEligibleOrders: async () => {
    const response = await httpClient.get(`${API_BASE}/orders/eligible`);
    return response.data;
  },

  generateInvoice: async (orderId, payload = {}) => {
    const url = `${API_BASE}/orders/${orderId}`;
    console.log('Generating invoice - URL:', url);
    console.log('Generating invoice - Payload:', payload);
    const response = await httpClient.post(url, payload);
    return response.data;
  },

  getAllInvoices: async () => {
    const response = await httpClient.get(API_BASE);
    return response.data;
  },

  getInvoiceById: async (invoiceId) => {
    const response = await httpClient.get(`${API_BASE}/${invoiceId}`);
    return response.data;
  }
};
