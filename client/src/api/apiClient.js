import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to every outgoing request if stored
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error messages consistently
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, clear local credentials
      localStorage.removeItem('jobpilot_token');
      localStorage.removeItem('jobpilot_user');
      // Dispatch custom auth event so React context handles it smoothly
      window.dispatchEvent(new Event('jobpilot:auth_expired'));
    }

    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred',
      errors: error.response?.data?.errors || null,
      status: error.response?.status || 500,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
