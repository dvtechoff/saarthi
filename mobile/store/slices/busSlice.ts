import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Bus {
  id: string;
  routeId: string;
  routeName: string;
  currentStop: string;
  nextStop: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  occupancy: 'low' | 'medium' | 'high';
  lastUpdated: string;
  isActive: boolean;
}

export interface Route {
  id: string;
  name: string;
  stops: BusStop[];
  color: string;
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
}

export interface BusState {
  buses: Bus[];
  routes: Route[];
  selectedBus: Bus | null;
  selectedRoute: Route | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: BusState = {
  buses: [],
  routes: [],
  selectedBus: null,
  selectedRoute: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const busSlice = createSlice({
  name: 'bus',
  initialState,
  reducers: {
    setBuses: (state, action: PayloadAction<Bus[]>) => {
      state.buses = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updateBus: (state, action: PayloadAction<Bus>) => {
      const index = state.buses.findIndex(bus => bus.id === action.payload.id);
      if (index !== -1) {
        state.buses[index] = action.payload;
      } else {
        state.buses.push(action.payload);
      }
      state.lastUpdated = new Date().toISOString();
    },
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      state.routes = action.payload;
    },
    setSelectedBus: (state, action: PayloadAction<Bus | null>) => {
      state.selectedBus = action.payload;
    },
    setSelectedRoute: (state, action: PayloadAction<Route | null>) => {
      state.selectedRoute = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
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
  setBuses,
  updateBus,
  setRoutes,
  setSelectedBus,
  setSelectedRoute,
  setLoading,
  setError,
  clearError,
} = busSlice.actions;

export default busSlice.reducer;
