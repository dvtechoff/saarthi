import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { setAuthToken } from '../../services/auth-token';
import { API_CONFIG } from '../../config/api';

export interface User {
  id: string;
  email: string;
  role: 'commuter' | 'driver' | 'authority';
  name?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Get the correct API URL based on platform
const getApiUrl = () => {
  // For development, always use the device IP address
  // This works for both physical devices and emulators
  return API_CONFIG.DEVICE_BASE_URL || API_CONFIG.BASE_URL;
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const apiUrl = getApiUrl();
      console.log('Login API URL:', apiUrl);
      console.log('Login credentials:', { email: credentials.email, password: '***' });
      
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error response:', errorData);
        throw new Error(errorData.detail || `Login failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Login success data:', data);
      const { user, access_token } = data;
      
      setAuthToken(access_token);
      // Store in secure storage
      await SecureStore.setItemAsync('auth', JSON.stringify({ user, token: access_token }));
      
      return { user, token: access_token };
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; role: 'commuter' | 'driver' | 'authority'; name?: string; phone?: string }, { rejectWithValue }) => {
    try {
      const apiUrl = getApiUrl();
      console.log('Register API URL:', apiUrl);
      console.log('Register user data:', { ...userData, password: '***' });
      
      const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Register error response:', errorData);
        throw new Error(errorData.detail || `Registration failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Register success data:', data);
      const { user, access_token } = data;
      
      setAuthToken(access_token);
      // Store in secure storage
      await SecureStore.setItemAsync('auth', JSON.stringify({ user, token: access_token }));
      
      return { user, token: access_token };
    } catch (error: any) {
      console.error('Register error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const stored = await SecureStore.getItemAsync('auth');
      if (stored) {
        const { user, token } = JSON.parse(stored);
        setAuthToken(token);
        return { user, token };
      }
      return null;
    } catch (error) {
      return rejectWithValue('Failed to load stored auth');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync('auth');
      setAuthToken(null);
      return null;
    } catch (error) {
      return rejectWithValue('Failed to logout');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load stored auth
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
