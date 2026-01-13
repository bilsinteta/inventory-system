import axios from './axios';

const exportService = {
    downloadProducts: async () => {
        const response = await axios.get('/admin/export/products', {
            responseType: 'blob', // Important for file downloads
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `inventory_products_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    downloadActivityLogs: async () => {
        const response = await axios.get('/admin/export/logs', {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};

export { exportService };
