import axios from 'axios';

// The base URL can be defined in .env. It defaults to /api when using the Vite proxy.
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for requests (e.g., attach a token)
api.interceptors.request.use(
  (config) => {
    // Attach the auth token if we have one
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses (e.g., handle global errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized. Please log in again.');
      // Handle logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
      // Only redirect if we are not already on the login or register page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
