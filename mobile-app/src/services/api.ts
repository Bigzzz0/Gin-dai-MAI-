import axios from 'axios';

// In a real app, you would load this from an environment variable
// e.g. process.env.EXPO_PUBLIC_API_URL
const API_URL = 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiService = {
    // We will implement specific routes later
    analyzeImage: async (formData: FormData) => {
        /* 
          const response = await apiClient.post('/scans/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return response.data;
        */
    },
};
