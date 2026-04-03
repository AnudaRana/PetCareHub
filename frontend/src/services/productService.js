import axios from 'axios';

const API_BASE_URL = '/api/products';

export const getAllProducts = () => axios.get(API_BASE_URL);

export const getProductById = (id) => axios.get(`${API_BASE_URL}/${id}`);

export const createProduct = (productData) => axios.post(API_BASE_URL, productData);

export const updateProduct = (id, productData) => axios.put(`${API_BASE_URL}/${id}`, productData);

export const deleteProduct = (id) => axios.delete(`${API_BASE_URL}/${id}`);
