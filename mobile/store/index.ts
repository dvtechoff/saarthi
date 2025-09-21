import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import busReducer from './slices/busSlice';
import locationReducer from './slices/locationSlice';
import tripReducer from './slices/tripSlice';

// Create the store with proper configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    bus: busReducer,
    location: locationReducer,
    trip: tripReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
