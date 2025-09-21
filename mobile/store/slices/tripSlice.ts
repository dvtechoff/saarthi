import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiEndpoints } from '../../services/api';

export interface ActiveTrip {
  tripId: string;
  routeId: number;
  routeName: string;
  busId: number;
  busNumber: string;
  startTime: string;
  status: string;
}

export interface TripState {
  activeTrip: ActiveTrip | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TripState = {
  activeTrip: null,
  isLoading: false,
  error: null,
};

export const fetchActiveTrip = createAsyncThunk(
  'trip/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiEndpoints.getActiveTrip();
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No active trip found - this is not an error
        return null;
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch active trip');
    }
  }
);

export const startTrip = createAsyncThunk(
  'trip/start',
  async (routeId: string, { rejectWithValue }) => {
    try {
      const response = await apiEndpoints.startTrip(routeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start trip');
    }
  }
);

export const stopTrip = createAsyncThunk(
  'trip/stop',
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await apiEndpoints.stopTrip(tripId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to stop trip');
    }
  }
);

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    clearTrip: (state) => {
      state.activeTrip = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active trip
      .addCase(fetchActiveTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTrip = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Start trip
      .addCase(startTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        // Note: We'll need to fetch the full trip details after starting
        state.error = null;
      })
      .addCase(startTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Stop trip
      .addCase(stopTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(stopTrip.fulfilled, (state) => {
        state.isLoading = false;
        state.activeTrip = null;
        state.error = null;
      })
      .addCase(stopTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTrip, clearError } = tripSlice.actions;
export default tripSlice.reducer;
