import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '', // Empty base URL since we're using Vite's proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Log error response for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Authentication required'));
    }

    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export const fetchWithAuth = async (endpoint: string) => {
  try {
    return await api.get(endpoint);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
