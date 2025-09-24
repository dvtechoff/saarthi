// API Configuration
// Set to true to use mock data, false to use real backend
export const USE_MOCK_API = false; // Use real backend data

// Backend URLs
export const API_CONFIG = {
  // Production Railway URL - UPDATE THIS AFTER DEPLOYING TO RAILWAY
  PRODUCTION_BASE_URL: 'https://saarthi-track.up.railway.app',
  PRODUCTION_WS_URL: 'wss://saarthi-track.up.railway.app',
  
  // Local development URLs
  BASE_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  ANDROID_BASE_URL: 'http://10.0.2.2:8000',
  ANDROID_WS_URL: 'ws://10.0.2.2:8000',
  
  // For physical device, use Railway backend (Production)
  DEVICE_BASE_URL: 'https://saarthi-track.up.railway.app',
  DEVICE_WS_URL: 'wss://saarthi-track.up.railway.app',

  // Local development on physical device (uncomment if needed)
  // DEVICE_BASE_URL: 'http://192.168.6.151:8000',
  // DEVICE_WS_URL: 'ws://192.168.6.151:8000',
};

// Environment detection
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return API_CONFIG.PRODUCTION_BASE_URL;
  }
  return API_CONFIG.BASE_URL;
};

const getWsUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return API_CONFIG.PRODUCTION_WS_URL;
  }
  return API_CONFIG.WS_URL;
};

export const CURRENT_API_BASE_URL = getBaseUrl();
export const CURRENT_WS_URL = getWsUrl();

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
