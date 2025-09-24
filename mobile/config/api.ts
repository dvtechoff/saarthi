// API Configuration
// Set to true to use mock data, false to use real backend
export const USE_MOCK_API = false; // Use real backend data

// Backend URLs
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  ANDROID_BASE_URL: 'http://10.0.2.2:8000',
  ANDROID_WS_URL: 'ws://10.0.2.2:8000',
  
  // For physical device, use your computer's IP address (update this with your actual IP)
  DEVICE_BASE_URL: 'http://192.168.6.151:8000',
  DEVICE_WS_URL: 'ws://192.168.6.151:8000',
};

// Mock user credentials for testing
export const MOCK_CREDENTIALS = {
  COMMUTER: {
    email: 'commuter@test.com',
    password: 'password123'
  },
  DRIVER: {
    email: 'driver@test.com',
    password: 'password123'
  }
};
