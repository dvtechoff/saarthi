import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import busReducer from './slices/busSlice';
import locationReducer from './slices/locationSlice';

// Create the store with proper configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    bus: busReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
