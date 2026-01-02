import axios from './axios';

export const productService = {
  // Get all products with pagination & search
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    
    const response = await axios.get(`/products?${queryParams.toString()}`);
    return response.data;
  },

  // Get single product
  getById: async (id) => {
    const response = await axios.get(`/products/${id}`);
    return response.data.product;
  },

  // Create product with image
  create: async (formData) => {
    const response = await axios.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product with image
  update: async (id, formData) => {
    const response = await axios.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await axios.delete(`/products/${id}`);
    return response.data;
  },

  // Get low stock products
  getLowStock: async () => {
    const response = await axios.get('/products/low-stock');
    return response.data;
  },

  // Update stock
  updateStock: async (id, data) => {
    const response = await axios.post(`/products/${id}/stock`, data);
    return response.data;
  },

  // Get stock history
  getStockHistory: async (id) => {
    const response = await axios.get(`/products/${id}/history`);
    return response.data;
  },
};