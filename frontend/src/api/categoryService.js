import axios from './axios';

export const categoryService = {
    // Get all categories
    getAll: async () => {
        const response = await axios.get('/categories');
        return response.data;
    },

    // Create category
    create: async (data) => {
        const response = await axios.post('/categories', data);
        return response.data;
    },

    // Update category
    update: async (id, data) => {
        const response = await axios.put(`/categories/${id}`, data);
        return response.data;
    },

    // Delete category
    delete: async (id) => {
        const response = await axios.delete(`/categories/${id}`);
        return response.data;
    },
};
