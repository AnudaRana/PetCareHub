import { httpClient } from "./httpClient";

export const orderService = {
  getCheckoutContext: async (userId) => (await httpClient.get(`/api/checkout/${userId}/context`)).data,
  createOrderFromCart: async (userId, payload) => (await httpClient.post(`/api/checkout/${userId}/orders`, payload)).data,
  getPendingOrders: async (userId) => (await httpClient.get(`/api/checkout/${userId}/orders/pending`)).data,
  getOrder: async (userId, orderId) => (await httpClient.get(`/api/checkout/${userId}/orders/${orderId}`)).data,
  submitPayment: async (userId, orderId, paymentMethod, receiptFile) => {
    const formData = new FormData();
    formData.append("paymentMethod", paymentMethod);
    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    const response = await httpClient.post(`/api/checkout/${userId}/orders/${orderId}/payment`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },
  cancelOrder: async (userId, orderId) => (await httpClient.delete(`/api/checkout/${userId}/orders/${orderId}`)).data
};
