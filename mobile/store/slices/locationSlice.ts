import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

export interface LocationState {
  currentLocation: Location.LocationObject | null;
  isTracking: boolean;
  permissionGranted: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  permissionGranted: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location.LocationObject | null>) => {
      state.currentLocation = action.payload;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setPermissionGranted: (state, action: PayloadAction<boolean>) => {
      state.permissionGranted = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentLocation,
  setTracking,
  setPermissionGranted,
  setError,
  clearError,
} = locationSlice.actions;

export default locationSlice.reducer;
