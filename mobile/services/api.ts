import axios, { AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { getAuthToken } from './auth-token';
import { mockApiEndpoints } from './mockAuth';
import { USE_MOCK_API, API_CONFIG } from '../config/api';
import { Platform } from 'react-native';

// Use Railway backend URL
import { CURRENT_API_BASE_URL } from '../config/api';
const API_BASE_URL = CURRENT_API_BASE_URL;


export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API endpoints - conditionally use mock or real backend
export const apiEndpoints = {
  // Auth endpoints
  login: (credentials: { email: string; password: string }) =>
    USE_MOCK_API 
      ? mockApiEndpoints.login(credentials.email, credentials.password)
      : api.post('/api/v1/auth/login', credentials),
  
  register: (userData: { email: string; password: string; role: 'commuter' | 'driver' | 'authority'; name?: string; phone?: string }) =>
    USE_MOCK_API 
      ? mockApiEndpoints.register(userData)
      : api.post('/api/v1/auth/register', userData),
  
  // Commuter endpoints
  getNearbyBuses: (lat: number, lng: number, radius: number = 5000) =>
    USE_MOCK_API 
      ? mockApiEndpoints.getNearbyBuses()
      : api.get(`/api/v1/commuter/buses/nearby`, { params: { lat, lng, radius } }),
  
  getBusETA: (busId: string, stopId: string) =>
    USE_MOCK_API 
      ? mockApiEndpoints.getBusETA(busId, stopId)
      : api.get(`/api/v1/commuter/bus/${busId}/eta/${stopId}`),
  
  submitFeedback: (data: { busId: string; occupancy: 'low' | 'medium' | 'high'; comment?: string }) =>
    USE_MOCK_API 
      ? mockApiEndpoints.submitFeedback(data)
      : api.post('/api/v1/commuter/feedback', data),
  
  // Driver endpoints
  getAssignedRoutes: async () => {
    if (USE_MOCK_API) {
      return api.get('/api/v1/driver/routes');
    } else {
      // Return live API call for production
      return api.get('/api/v1/driver/routes');
    }
  },
  
  // Get current active trip for the logged-in driver
  getActiveTrip: () =>
    USE_MOCK_API
      ? Promise.resolve({ data: { tripId: null, routeId: null, status: 'inactive' } })
      : api.get('/api/v1/driver/trip/active'),

  getDriverStats: () =>
    USE_MOCK_API
      ? Promise.resolve({ data: { totalTrips: 0, kmDriven: 0, passengers: 0 } })
      : api.get('/api/v1/driver/stats'),

  getDriverTrips: (limit: number = 50) =>
    USE_MOCK_API
      ? Promise.resolve({ data: [] })
      : api.get('/api/v1/driver/trips', { params: { limit } }),
  
  startTrip: (routeId: string) =>
    USE_MOCK_API 
      ? Promise.resolve({ data: { tripId: `trip_${Date.now()}` } })
      : api.post(`/api/v1/driver/trip/start?routeId=${routeId}`),
  
  stopTrip: (tripId: string) =>
    USE_MOCK_API 
      ? Promise.resolve({ data: { success: true } })
      : api.post(`/api/v1/driver/trip/stop?tripId=${tripId}`),
  
  updateLocation: (data: { latitude: number; longitude: number; heading?: number; speed?: number }) =>
    USE_MOCK_API 
      ? Promise.resolve({ data: { success: true } })
      : api.post('/api/v1/driver/location', data),
  
  // Authority endpoints
  getAllBuses: () =>
    USE_MOCK_API 
      ? mockApiEndpoints.getNearbyBuses()
      : api.get('/api/v1/authority/buses/all'),
  
  getAnalytics: (dateRange?: { start: string; end: string }) =>
    USE_MOCK_API 
      ? Promise.resolve({ data: { trips: 150, delays: 5, feedbacks: 23 } })
      : api.get('/api/v1/authority/analytics', { params: dateRange }),
  
  getTripHistory: (driverId?: string) =>
    USE_MOCK_API 
      ? Promise.resolve({ data: { trips: [] } })
      : api.get('/api/v1/authority/trips', { params: { driverId } }),
};

export default api;