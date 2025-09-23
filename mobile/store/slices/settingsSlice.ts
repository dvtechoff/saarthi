import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

export type AppTheme = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'hi';

export interface SettingsState {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  theme: AppTheme;
  language: AppLanguage;
  isLoading: boolean;
}

const SETTINGS_KEY = 'driver_settings_v1';

const initialState: SettingsState = {
  notificationsEnabled: true,
  locationEnabled: true,
  theme: 'light',
  language: 'en',
  isLoading: false,
};

export const loadSettings = createAsyncThunk('settings/load', async () => {
  const raw = await SecureStore.getItemAsync(SETTINGS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<SettingsState>;
  } catch {
    return null;
  }
});

export const saveSettings = createAsyncThunk(
  'settings/save',
  async (settings: Partial<SettingsState>) => {
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.locationEnabled = action.payload;
    },
    setTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.language = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const { notificationsEnabled, locationEnabled, theme, language } = action.payload;
          if (typeof notificationsEnabled === 'boolean') state.notificationsEnabled = notificationsEnabled;
          if (typeof locationEnabled === 'boolean') state.locationEnabled = locationEnabled;
          if (theme) state.theme = theme;
          if (language) state.language = language;
        }
      })
      .addCase(loadSettings.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        const { notificationsEnabled, locationEnabled, theme, language } = action.payload;
        if (typeof notificationsEnabled === 'boolean') state.notificationsEnabled = notificationsEnabled;
        if (typeof locationEnabled === 'boolean') state.locationEnabled = locationEnabled;
        if (theme) state.theme = theme;
        if (language) state.language = language;
      });
  }
});

export const { setNotificationsEnabled, setLocationEnabled, setTheme, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;


