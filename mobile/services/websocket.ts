import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { store } from '../store';
import { setError, updateBus } from '../store/slices/busSlice';
import { setCurrentLocation } from '../store/slices/locationSlice';
import { getAuthToken } from './auth-token';
import { API_CONFIG } from '../config/api';

// Use consistent WebSocket URL for all platforms
const WS_URL = API_CONFIG.DEVICE_WS_URL || API_CONFIG.WS_URL;

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string) {
    if (this.socket?.connected) return;

    try {
      this.socket = io(WS_URL, {
        transports: ['polling'], // Use polling only to avoid protocol issues
        auth: { token },
        timeout: 10000,
        reconnection: false, // Disable automatic reconnection
        forceNew: true,
        autoConnect: true,
      });
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return;
    }

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Join appropriate room based on user role
      const user = store.getState().auth.user;
      if (user) {
        this.joinRoom(user.role, user.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      // Don't automatically reconnect to prevent error loops
      // this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.warn('WebSocket connection error:', error);
      // Don't show error to user, just log it
      // store.dispatch(setError('Connection failed. Retrying...'));
      // this.handleReconnect();
    });

    // Server connection confirmation
    this.socket.on('server:connected', (data: any) => {
      console.log('Server confirmed connection:', data);
    });

    // Room joined confirmation
    this.socket.on('room_joined', (data: any) => {
      console.log('Joined room:', data.room);
    });

    // Bus location updates
    this.socket.on('bus:location', (data: any) => {
      console.log('Bus location update received:', data);
      store.dispatch(updateBus(data));
    });

    // Bus status updates
    this.socket.on('bus:status', (data: any) => {
      console.log('Bus status update received:', data);
      store.dispatch(updateBus(data));
    });

    // Driver location updates
    this.socket.on('driver:location', (data: any) => {
      console.log('Driver location update received:', data);
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
      console.log('Pong received:', data);
    });
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
