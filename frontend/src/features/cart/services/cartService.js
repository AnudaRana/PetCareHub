import { httpClient } from "./httpClient";

export const cartService = {
  getCart: async (userId) => (await httpClient.get(`/api/cart/${userId}`)).data,
  addItem: async (userId, productId, quantity = 1) =>
    (await httpClient.post(`/api/cart/${userId}/items`, { productId, quantity })).data,
  updateQuantity: async (userId, productId, quantity) =>
    (await httpClient.put(`/api/cart/${userId}/items/${productId}`, { quantity })).data,
  removeItem: async (userId, productId) =>
    (await httpClient.delete(`/api/cart/${userId}/items/${productId}`)).data
};
