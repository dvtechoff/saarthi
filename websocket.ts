import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { store } from '../store';
import { setError, updateBus } from '../store/slices/busSlice';
import { setCurrentLocation } from '../store/slices/locationSlice';
import { getAuthToken } from './auth-token';
import { API_CONFIG } from '../config/api';

// Use appropriate WebSocket URL based on platform
const WS_URL = Platform.OS === 'android' 
  ? API_CONFIG.ANDROID_WS_URL 
  : API_CONFIG.WS_URL;

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string) {
    if (this.socket?.connected) return;

    // Validate token before attempting connection
    if (!token || token.trim() === '') {
      console.warn('WebSocket connection skipped: No valid token provided');
      return;
    }

    try {
      this.socket = io(WS_URL, {
        transports: ['websocket'],
        auth: { token },
        timeout: 10000, // Reduced timeout
        reconnection: false, // Disable automatic reconnection
      });

      this.socket.on('connect', () => {
        this.reconnectAttempts = 0;
        
        // Join appropriate room based on user role
        const user = store.getState().auth.user;
        if (user) {
          this.joinRoom(user.role, user.id);
        }
      });

      this.socket.on('disconnect', (reason) => {
        // Only attempt reconnection for network issues, not server disconnections
        if (reason === 'io server disconnect') {
          // Server disconnected us, don't reconnect automatically
          return;
        }
        // For other reasons (network issues), try to reconnect
        this.handleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.warn('WebSocket connection failed, falling back to API polling:', error.message);
        // Don't dispatch error to UI, just log it
        // The app will work fine with API polling only
        if (this.reconnectAttempts < 2) { // Only try twice
          this.handleReconnect();
        }
      });
    } catch (error) {
      console.warn('WebSocket initialization failed:', error);
      // Don't throw error, app should continue working with API only
    }

    // Server connection confirmation
      // Set up event listeners only if socket was created successfully
      if (this.socket) {
        this.socket.on('server:connected', (data: any) => {
          // Server confirmed connection
        });

        // Room joined confirmation
        this.socket.on('room_joined', (data: any) => {
          // Room joined successfully
        });

        // Bus location updates
        this.socket.on('bus:location', (data: any) => {
      const currentUser = store.getState().auth.user;
      
      if (currentUser?.role === 'commuter') {
        // For commuters, update the bus location with the received data
        const currentBuses = store.getState().bus.buses;
        const busToUpdate = currentBuses.find(bus => 
          bus.id === data.busId || 
          bus.id === data.id ||
          bus.routeId === data.routeId
        );
        
        if (busToUpdate) {
          const updatedBus = {
            ...busToUpdate,
            latitude: data.latitude || data.lat,
            longitude: data.longitude || data.lng,
            heading: data.heading || 0,
            speed: data.speed || 0,
            lastUpdated: new Date().toISOString(),
          };
          store.dispatch(updateBus(updatedBus));
        }
      }
    });

    // Bus status updates
    this.socket.on('bus:status', (data: any) => {
      console.log('Bus status update received:', data);
      store.dispatch(updateBus(data));
    });

    // Driver location updates
    this.socket.on('driver:location', (data: any) => {
      const currentUser = store.getState().auth.user;
      
      if (currentUser?.role === 'driver') {
        // For drivers, update their current location
        store.dispatch(setCurrentLocation({
          coords: {
            latitude: data.latitude || data.lat,
            longitude: data.longitude || data.lng,
            altitude: null,
            accuracy: data.accuracy || 10,
            altitudeAccuracy: null,
            heading: data.heading || 0,
            speed: data.speed || 0,
          },
          timestamp: data.timestamp || data.ts || Date.now(),
        } as any));
      } else if (currentUser?.role === 'commuter') {
        // For commuters, update the bus location based on the driver's location
        // Find the bus associated with this driver
        const currentBuses = store.getState().bus.buses;
        const busToUpdate = currentBuses.find(bus => 
          bus.id === data.busId || bus.routeId === data.routeId
        );
        
        if (busToUpdate) {
          const updatedBus = {
            ...busToUpdate,
            latitude: data.latitude || data.lat,
            longitude: data.longitude || data.lng,
            heading: data.heading || 0,
            speed: data.speed || 0,
            lastUpdated: new Date().toISOString(),
          };
          store.dispatch(updateBus(updatedBus));
        }
      }
    });

    // Route change updates
    this.socket.on('driver:route:changed', (data: any) => {
      const currentUser = store.getState().auth.user;
      
      if (currentUser?.role === 'commuter') {
        // When a driver changes routes, refresh bus data to get updated route info
        // This will be handled by the commuter app's useEffect hook
        // No direct action needed here as the API refresh will handle it
      }
    });

    // ETA updates
    this.socket.on('eta:update', (data: any) => {
      console.log('ETA update received:', data);
      // Handle ETA updates in the UI
    });

    // Feedback updates
    this.socket.on('feedback:new', (data: any) => {
      console.log('New feedback received:', data);
      // Handle new feedback notifications
    });

    // Error handling
    this.socket.on('error', (data: any) => {
      console.error('WebSocket error:', data);
      store.dispatch(setError(data.message || 'WebSocket error'));
    });

        // Pong response
        this.socket.on('pong', (data: any) => {
          // Pong received
        });
      }
    } catch (error) {
      console.warn('WebSocket initialization failed:', error);
      // Don't throw error, app should continue working with API only
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(userType: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', {
        user_type: userType,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('WebSocket not connected. Cannot join room');
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected. Cannot emit event:', event);
    }
  }

  // Specific methods for different user types
  emitDriverLocation(data: { lat: number; lng: number; heading?: number; speed?: number; accuracy?: number }) {
    this.emit('driver_location_update', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  emitBusStatus(data: { busId: string; status: string; occupancy?: string }) {
    this.emit('bus_status_update', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  emitFeedback(data: { busId: string; occupancy: string; comment?: string }) {
    this.emit('feedback_submitted', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  ping() {
    this.emit('ping', { timestamp: new Date().toISOString() });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(getAuthToken() || '');
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      store.dispatch(setError('Unable to connect to server. Please check your connection.'));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
