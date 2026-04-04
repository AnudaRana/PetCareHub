import { httpClient } from "./httpClient";

export const orderService = {
  getCheckoutContext: async (userId) =>
    (await httpClient.get(`/api/checkout/users/${userId}/context`)).data,

  createOrderFromCart: async (userId, payload) =>
    (await httpClient.post(`/api/checkout/users/${userId}/orders`, payload)).data,

  getPendingOrders: async (userId) =>
    (await httpClient.get(`/api/orders/users/${userId}/pending-payment`)).data,

  getOrder: async (userId, orderId) =>
    (await httpClient.get(`/api/orders/users/${userId}/${orderId}`)).data
};
