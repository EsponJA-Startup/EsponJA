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
    // If we have an auth token in the future, we can add it here.
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses (e.g., handle global errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized. Please log in again.');
      // Handle logout or token refresh logic here
    }
    return Promise.reject(error);
  }
);

export default api;
