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
  if (Platform.OS === 'android') {
    // For Android, try emulator first, then device IP
    return API_CONFIG.ANDROID_BASE_URL;
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, use localhost
    return API_CONFIG.BASE_URL;
  } else {
    // For physical devices, use device IP
    return API_CONFIG.DEVICE_BASE_URL || API_CONFIG.BASE_URL;
  }
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Use apiEndpoints which handles mock vs real API automatically
      const { apiEndpoints } = await import('../../services/api');
      const response = await apiEndpoints.login(credentials);
      
      // Handle both mock response and API response formats
      const data = 'data' in response ? response.data : response;
      
      // Backend returns { access_token, user }, mock returns { token, user }
      const user = data.user;
      const token = data.access_token || data.token;
      
      setAuthToken(token);
      // Store in secure storage
      await SecureStore.setItemAsync('auth', JSON.stringify({ user, token }));
      
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; role: 'commuter' | 'driver' | 'authority'; name?: string; phone?: string }, { rejectWithValue }) => {
    try {

      
      // Use apiEndpoints which handles mock vs real API automatically
      const { apiEndpoints } = await import('../../services/api');
      const response = await apiEndpoints.register(userData);
      
      // Handle both mock response and API response formats
      const data = 'data' in response ? response.data : response;
      
      // Backend returns { access_token, user }, mock returns { token, user }
      const user = data.user;
      const token = data.access_token || data.token;
      
      setAuthToken(token);
      // Store in secure storage
      await SecureStore.setItemAsync('auth', JSON.stringify({ user, token }));
      

      return { user, token };
    } catch (error: any) {

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
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
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
