import axios from 'axios';

const API_BASE_URL = '/api/products';

const productService = {
  getAllProducts: () => axios.get(API_BASE_URL),
  getProductById: (id) => axios.get(`${API_BASE_URL}/${id}`),
  createProduct: (productData) => axios.post(API_BASE_URL, productData),
  updateProduct: (id, productData) => axios.put(`${API_BASE_URL}/${id}`, productData),
  deleteProduct: (id) => axios.delete(`${API_BASE_URL}/${id}`)
};

export default productService;
