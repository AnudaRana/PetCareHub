import { httpClient } from '../../cart/services/httpClient';

const API_BASE = '/api/owner/billing';

export const billingService = {
  getBillingOrders: async () => {
    const response = await httpClient.get(`${API_BASE}/orders`);
    return response.data;
  },

  getInvoiceForOrder: async (orderId) => {
    const response = await httpClient.get(`${API_BASE}/orders/${orderId}/invoice`);
    return response.data;
  },

  getInvoiceById: async (invoiceId) => {
    const response = await httpClient.get(`${API_BASE}/invoices/${invoiceId}`);
    return response.data;
  }
};
