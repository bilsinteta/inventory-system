import axios from './axios';

export const supplierService = {
  getAll: async () => {
    const response = await axios.get('/suppliers');
    return response.data.suppliers;
  },

  getById: async (id) => {
    const response = await axios.get(`/suppliers/${id}`);
    return response.data.supplier;
  },

  create: async (data) => {
    const response = await axios.post('/suppliers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/suppliers/${id}`);
    return response.data;
  },
};