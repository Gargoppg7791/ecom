import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const DEPLOYED = 'https://pear-poised-hen.cyclic.app/';
const LOCALHOST = 'http://localhost:5454';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || LOCALHOST;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/categories',
  '/api/carousel/active',
  '/api/products',
  '/uploads'
];

// Function to check if a route is public
const isPublicRoute = (url) => {
  return publicRoutes.some(route => url.includes(route));
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    
    // Only add token for non-public routes
    if (token && !isPublicRoute(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isPublicRoute(error.config.url)) {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Function to update token
export const updateAuthToken = (token) => {
  if (token) {
    localStorage.setItem('jwt', token);
  } else {
    localStorage.removeItem('jwt');
  }
};

export default api;
