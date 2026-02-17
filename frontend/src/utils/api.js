// API Helper - Centralized place for all backend API calls
import axios from 'axios';

// Base URL for your backend
const API_URL = 'https://dassass.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add token to requests automatically if user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all tokens on auth failure
      localStorage.removeItem('token');
      // Don't clear organizerToken or adminToken here - they have their own handling
    }
    return Promise.reject(error);
  }
);

// Create a separate axios instance for organizer API calls
export const organizerApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

organizerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('organizerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Don't auto-redirect - let pages handle their own auth errors
organizerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just pass the error through, let each page decide what to do
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION APIs
// ============================================

// Participant Login
export const loginParticipant = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Participant Signup
export const signupParticipant = async (firstName, lastName, email, password, participantType, contactNumber, collegeName) => {
  const response = await api.post('/auth/register', { 
    firstName, 
    lastName, 
    email, 
    password, 
    participantType,
    contactNumber,
    collegeName
  });
  return response.data;
};

// Get Participant Profile
export const getParticipantProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Organizer Login
export const loginOrganizer = async (email, password) => {
  const response = await api.post('/organizers/login', { email, password });
  return response.data;
};

// Admin Login
export const loginAdmin = async (email, password) => {
  const response = await api.post('/admin/login', { email, password });
  return response.data;
};

// ============================================
// EVENTS APIs
// ============================================

export const getAllEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

// ============================================
// REGISTRATIONS APIs
// ============================================

export const registerForEvent = async (eventId, registrationData) => {
  const response = await api.post(`/registrations/events/${eventId}`, registrationData);
  return response.data;
};

export const getMyRegistrations = async () => {
  const response = await api.get('/registrations/my-registrations');
  return response.data;
};

export default api;

// EXPLANATION:
// - axios.create() creates a reusable axios instance with default settings
// - interceptors.request.use() adds the JWT token to every request automatically
// - localStorage.getItem('token') retrieves saved token
// - Each function returns a promise with the API response
// - Import these functions in your components: import { loginParticipant } from '../utils/api'

