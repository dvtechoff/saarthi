import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { setBuses, setRoutes } from '../store/slices/busSlice';
import { apiEndpoints } from './api';

const CACHE_KEYS = {
  BUSES: 'cached_buses',
  ROUTES: 'cached_routes',
  OFFLINE_FEEDBACK: 'offline_feedback',
  LAST_SYNC: 'last_sync',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class OfflineService {
  // Cache buses data
  static async cacheBuses(buses: any[]) {
    try {
      const cacheData = {
        data: buses,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.BUSES, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching buses:', error);
    }
  }

  // Get cached buses
  static async getCachedBuses(): Promise<any[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.BUSES);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached buses:', error);
      return null;
    }
  }

  // Cache routes data
  static async cacheRoutes(routes: any[]) {
    try {
      const cacheData = {
        data: routes,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.ROUTES, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching routes:', error);
    }
  }

  // Get cached routes
  static async getCachedRoutes(): Promise<any[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.ROUTES);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached routes:', error);
      return null;
    }
  }

  // Store offline feedback
  static async storeOfflineFeedback(feedback: any) {
    try {
      const existing = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_FEEDBACK);
      const feedbacks = existing ? JSON.parse(existing) : [];
      feedbacks.push(feedback);
      await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_FEEDBACK, JSON.stringify(feedbacks));
    } catch (error) {
      console.error('Error storing offline feedback:', error);
    }
  }

  // Get offline feedbacks
  static async getOfflineFeedbacks(): Promise<any[]> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_FEEDBACK);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting offline feedbacks:', error);
      return [];
    }
  }

  // Clear offline feedbacks
  static async clearOfflineFeedbacks() {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.OFFLINE_FEEDBACK);
    } catch (error) {
      console.error('Error clearing offline feedbacks:', error);
    }
  }

  // Sync offline data when online
  static async syncOfflineData() {
    try {
      const offlineFeedbacks = await this.getOfflineFeedbacks();
      
      if (offlineFeedbacks.length > 0) {
        console.log(`Syncing ${offlineFeedbacks.length} offline feedbacks...`);
        
        for (const feedback of offlineFeedbacks) {
          try {
            await apiEndpoints.submitFeedback(feedback);
            console.log('Synced feedback:', feedback.busId);
          } catch (error) {
            console.error('Error syncing feedback:', error);
            // Keep the feedback for next sync attempt
            break;
          }
        }
        
        // If all feedbacks synced successfully, clear offline storage
        if (offlineFeedbacks.length > 0) {
          await this.clearOfflineFeedbacks();
          console.log('All offline data synced successfully');
        }
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  // Load cached data into store
  static async loadCachedData() {
    try {
      // Load cached buses
      const cachedBuses = await this.getCachedBuses();
      if (cachedBuses) {
        store.dispatch(setBuses(cachedBuses));
        console.log('Loaded cached buses:', cachedBuses.length);
      }

      // Load cached routes
      const cachedRoutes = await this.getCachedRoutes();
      if (cachedRoutes) {
        store.dispatch(setRoutes(cachedRoutes));
        console.log('Loaded cached routes:', cachedRoutes.length);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }

  // Check if data is stale
  static async isDataStale(): Promise<boolean> {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      if (lastSync) {
        return Date.now() - parseInt(lastSync) > CACHE_DURATION;
      }
      return true;
    } catch (error) {
      console.error('Error checking data staleness:', error);
      return true;
    }
  }

  // Update last sync timestamp
  static async updateLastSync() {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Error updating last sync:', error);
    }
  }

  // Clear all cache
  static async clearAllCache() {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.BUSES,
        CACHE_KEYS.ROUTES,
        CACHE_KEYS.OFFLINE_FEEDBACK,
        CACHE_KEYS.LAST_SYNC,
      ]);
      console.log('All cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}
