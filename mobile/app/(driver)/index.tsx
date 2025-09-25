import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { apiEndpoints } from '../../services/api';
import { wsService } from '../../services/websocket';
import { AppDispatch, RootState } from '../../store';
import { Route, BusStop, setRoutes, setSelectedRoute } from '../../store/slices/busSlice';
import { setCurrentLocation, setPermissionGranted, setTracking } from '../../store/slices/locationSlice';

const { width, height } = Dimensions.get('window');

export default function DriverDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation, isTracking, permissionGranted } = useSelector((state: RootState) => state.location);
  const { routes, selectedRoute } = useSelector((state: RootState) => state.bus);
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);
  const [watchSubscription, setWatchSubscription] = useState<Location.LocationSubscription | null>(null);
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // Dashboard state
  const [distanceCovered, setDistanceCovered] = useState(12.5);
  const [timeRemaining, setTimeRemaining] = useState(25);
  const [passengerCount, setPassengerCount] = useState(0);
  const [isDelayed, setIsDelayed] = useState(false);
  
  // Route tracking state
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [routeDirections, setRouteDirections] = useState<Array<{latitude: number; longitude: number}>>([]);
  const [nextStop, setNextStop] = useState<BusStop | null>(null);
  const [routeProgress, setRouteProgress] = useState(0);
  
  // Route selector modal state
  const [showRouteSelector, setShowRouteSelector] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    fetchAssignedRoutes();
  }, []);

  // On app open, check backend for any active trip and reflect status
  useEffect(() => {
    const checkActiveTrip = async () => {
      if (!token) return; // wait for token restore
      try {
        const resp = await apiEndpoints.getActiveTrip();
        const active = resp?.data;
        if (active && active.tripId) {
          setTripId(active.tripId);
          dispatch(setTracking(true));
        } else {
          setTripId(null);
          dispatch(setTracking(false));
        }
      } catch (error) {
        setTripId(null);
        dispatch(setTracking(false));
      }
    };
    checkActiveTrip();
  }, [dispatch, token]);

  // On mount, check if there is an active trip for this driver
  useEffect(() => {
    const restoreActiveTrip = async () => {
      try {
        const resp = await apiEndpoints.getActiveTrip();
        const active = resp?.data;
        // Expecting shape: { tripId, routeId, status }
        if (active && active.tripId && active.routeId) {
          setTripId(active.tripId);
          dispatch(setTracking(true));
          // Ensure routes are loaded then select the active route
          if (routes && routes.length > 0) {
            const route = routes.find((r: any) => r.id === active.routeId) || routes[0];
            if (route) {
              dispatch(setSelectedRoute(route));
              setCurrentStopIndex(0);
              setNextStop(route.stops?.[0] || null);
              setRouteDirections(generateRouteDirections(route));
              updateMapRegionForRoute(route);
            }
          }
        } else {
          // No active trip
          setTripId(null);
          dispatch(setTracking(false));
        }
      } catch (e) {
        // On error, assume no active trip to avoid false positive UI
        setTripId(null);
        dispatch(setTracking(false));
      }
    };
    restoreActiveTrip();
  // include routes so when they load we can bind route selection
  }, [dispatch, routes]);

  useEffect(() => {
    if (permissionGranted && currentLocation) {
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [permissionGranted, currentLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        dispatch(setPermissionGranted(true));
        const location = await Location.getCurrentPositionAsync({});
        dispatch(setCurrentLocation(location));
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission is required for GPS tracking.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const fetchAssignedRoutes = async () => {
    try {
      setIsLoading(true);
      const response = await apiEndpoints.getAssignedRoutes();
      
      // Handle different response structures from backend
      let routes = [];
      if (response.data) {
        routes = Array.isArray(response.data) ? response.data : (response.data.routes || []);
      } else if (Array.isArray(response)) {
        routes = response;
      }
      
      dispatch(setRoutes(routes));
      
      // Auto-select first route if available and no route is currently selected
      if (routes.length > 0 && !selectedRoute) {
        dispatch(setSelectedRoute(routes[0]));
        updateMapRegionForRoute(routes[0]);
      }
      
      // Display info about assigned routes
      if (routes.length === 0) {
        Alert.alert(
          'No Routes Assigned', 
          'You don\'t have any routes assigned yet. Please contact your supervisor.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      // Set empty routes array on error to prevent undefined map
      dispatch(setRoutes([]));
      Alert.alert(
        'Error', 
        'Failed to fetch your assigned routes. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: fetchAssignedRoutes },
          { text: 'Cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startTrip = async () => {
    if (!selectedRoute) {
      Alert.alert('Error', 'Please select a route first');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiEndpoints.startTrip(selectedRoute.id);
      
      setTripId(response.data.tripId);
      dispatch(setTracking(true));
      
      // Close route selector since trip is now active
      setShowRouteSelector(false);
      
      // Initialize route tracking
      setCurrentStopIndex(0);
      setRouteProgress(0);
      setNextStop(selectedRoute.stops[0]);
      
      // Generate route directions
      const directions = generateRouteDirections(selectedRoute);
      setRouteDirections(directions);
      
      // Update map to show full route
      updateMapRegionForRoute(selectedRoute);
      
      // Start location tracking
      startLocationTracking();
      
      // Close route selector since trip is now active
      setShowRouteSelector(false);
      
      Alert.alert('Success', `Trip started successfully!\nTrip ID: ${response.data.tripId}\nNext Stop: ${selectedRoute.stops[0]?.name}`);
    } catch (error: any) {
      console.error('Error starting trip:', error);
      let errorMessage = 'Failed to start trip';
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const detail = error.response?.data?.detail || '';
        if (detail.includes('no available bus')) {
          errorMessage = `No bus available for route "${selectedRoute.name}". Please contact your supervisor or try a different route.`;
        } else if (detail.includes('already has an active trip')) {
          errorMessage = 'You already have an active trip. Please stop the current trip before starting a new one.';
        } else if (detail.includes('Route not found')) {
          errorMessage = 'This route is no longer available. Please select a different route.';
        } else {
          errorMessage = detail || errorMessage;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Cannot Start Trip', errorMessage, [
        { text: 'OK' },
        ...(errorMessage.includes('no available bus') ? [
          { 
            text: 'Refresh Routes', 
            onPress: () => fetchAssignedRoutes() 
          }
        ] : [])
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const stopTrip = async () => {
    if (!tripId) {
      Alert.alert('No Active Trip', 'There is no active trip to stop.');
      return;
    }

    try {
      setIsLoading(true);
      await apiEndpoints.stopTrip(tripId);
      
      // Stop location tracking
      stopLocationTracking();
      
      setTripId(null);
      dispatch(setTracking(false));
      
      Alert.alert('Success', 'Trip stopped successfully');
    } catch (error: any) {
      console.error('Error stopping trip:', error);
      Alert.alert('Error', 'Failed to stop trip');
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = async () => {
    if (!permissionGranted) return;

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (location) => {
          dispatch(setCurrentLocation(location));
          
          const locationData = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            routeId: selectedRoute?.id,
            routeName: selectedRoute?.name,
            tripId: tripId,
            busId: user?.id, // Use driver ID as bus identifier
            ts: Date.now(),
          };

          // Send location via both WebSocket and REST API for reliability
          // WebSocket for real-time updates (if connected)
          if (wsService.isConnected()) {
            wsService.emit('driver:location', locationData);
          }
          
          // REST API as fallback/primary method
          try {
            await apiEndpoints.updateLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: location.coords.heading,
              speed: location.coords.speed,
            });
          } catch (error) {
            console.warn('Failed to update location via API:', error);
          }
        }
      );
      
      setWatchSubscription(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopLocationTracking = () => {
    if (watchSubscription) {
      watchSubscription.remove();
      setWatchSubscription(null);
    }
  };

  const handleRouteSelect = (route: Route) => {
    // Prevent route selection when a trip is running
    if (tripId) {
      Alert.alert(
        'Trip in Progress', 
        'Cannot change routes while a trip is running. Please stop the current trip first.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    dispatch(setSelectedRoute(route));
    updateMapRegionForRoute(route);
    setCurrentStopIndex(0);
    setRouteProgress(0);
    
    // Notify commuters about route change
    wsService.emit('driver_route_changed', {
      driverId: user?.id,
      busId: user?.id,
      newRouteId: route.id,
      newRouteName: route.name,
      timestamp: new Date().toISOString(),
    });
  };

  const updateMapRegionForRoute = (route: Route) => {
    if (!route.stops || route.stops.length === 0) return;

    // Calculate bounds for all stops
    const stops = Array.isArray(route.stops) ? route.stops : [];
    if (stops.length === 0) return;
    const latitudes = stops.map(stop => stop.latitude);
    const longitudes = stops.map(stop => stop.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latDelta = (maxLat - minLat) * 1.2; // Add 20% padding
    const lngDelta = (maxLng - minLng) * 1.2;
    
    setRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  const generateRouteDirections = (route: Route) => {
    if (!route.stops || route.stops.length < 2) return [];

    const directions = [];
    for (let i = 0; i < route.stops.length - 1; i++) {
      const currentStop = route.stops[i];
      const nextStop = route.stops[i + 1];
      
      // Calculate intermediate points for a more realistic route
      const steps = 10; // Number of intermediate points
      for (let j = 0; j <= steps; j++) {
        const ratio = j / steps;
        const lat = currentStop.latitude + (nextStop.latitude - currentStop.latitude) * ratio;
        const lng = currentStop.longitude + (nextStop.longitude - currentStop.longitude) * ratio;
        
        // Add some realistic curve to the route
        const curveOffset = Math.sin(ratio * Math.PI) * 0.001; // Small curve
        directions.push({
          latitude: lat + curveOffset,
          longitude: lng + curveOffset * 0.5,
        });
      }
    }
    return directions;
  };

  const handleReportDelay = () => {
    Alert.alert(
      'Report Delay',
      'Are you experiencing a delay?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Report Delay', 
          onPress: () => {
            setIsDelayed(true);
            Alert.alert('Delay Reported', 'Your delay has been reported to passengers');
          }
        }
      ]
    );
  };

  const handlePassengerCount = () => {
    Alert.prompt(
      'Passenger Count',
      'Enter current passenger count:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: (count?: string) => {
            const numCount = parseInt(count || '0');
            if (!isNaN(numCount)) {
              setPassengerCount(numCount);
              Alert.alert('Updated', `Passenger count set to ${numCount}`);
            }
          }
        }
      ],
      'plain-text',
      passengerCount.toString()
    );
  };

  const moveToNextStop = () => {
    if (!selectedRoute || currentStopIndex >= selectedRoute.stops.length - 1) {
      Alert.alert('Route Complete', 'You have reached the end of the route!');
      return;
    }

    const nextIndex = currentStopIndex + 1;
    setCurrentStopIndex(nextIndex);
    setNextStop(selectedRoute.stops[nextIndex + 1]);
    setRouteProgress((nextIndex / selectedRoute.stops.length) * 100);
    
    Alert.alert(
      'Stop Reached', 
      `Arrived at ${selectedRoute.stops[currentStopIndex]?.name}\nNext: ${selectedRoute.stops[nextIndex]?.name || 'End of Route'}`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.title}>Driver Dashboard</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isTracking ? '#EC4899' : '#9CA3AF' }]} />
            <Text style={[styles.statusText, { color: isTracking ? '#EC4899' : '#9CA3AF' }]}>
              {isTracking ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Assigned Routes Card */}
        <View style={styles.assignedRouteCard}>
          <Text style={styles.assignedRouteLabel}>Assigned Routes</Text>
          <View style={styles.routeInfo}>
            <View style={styles.routeDetails}>
              <Text style={styles.routeName}>
                {selectedRoute?.name || 'No Route Selected'}
              </Text>
              {selectedRoute && selectedRoute.stops && (
                <Text style={styles.routeDescription}>
                  {selectedRoute.stops.length} stops
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={[
                styles.routeChangeButton, 
                tripId && styles.routeChangeButtonDisabled
              ]}
              onPress={() => {
                if (tripId) {
                  Alert.alert(
                    'Trip in Progress', 
                    'Cannot browse routes while a trip is running. Please stop the current trip first.'
                  );
                  return;
                }
                setShowRouteSelector(!showRouteSelector);
              }}
              disabled={!!tripId}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={tripId ? "#999" : "#8B5CF6"} 
              />
              <Text style={[
                styles.changeRouteText, 
                tripId && styles.changeRouteTextDisabled
              ]}>
                Browse
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Show route info when selected */}
          {selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && (
            <View style={styles.routePreview}>
              <Text style={styles.routePreviewText}>
                {selectedRoute.stops[0]?.name} → {selectedRoute.stops[selectedRoute.stops.length - 1]?.name}
              </Text>
            </View>
          )}
          
          {/* Route selection list */}
          {showRouteSelector && routes && routes.length > 0 && (
            <View style={styles.routesList}>
              <Text style={styles.routesListTitle}>Available Routes ({routes.length})</Text>
              {routes.map((route, index) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeListItem,
                    selectedRoute?.id === route.id && styles.selectedRouteItem
                  ]}
                  onPress={() => {
                    handleRouteSelect(route);
                    setShowRouteSelector(false);
                  }}
                >
                  <View style={styles.routeItemContent}>
                    <Text style={styles.routeItemName}>{route.name}</Text>
                    <Text style={styles.routeItemInfo}>
                      {route.stops.length} stops
                    </Text>
                  </View>
                  {selectedRoute?.id === route.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Trip Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Trip Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distance Covered</Text>
              <Text style={styles.statValue}>{distanceCovered} km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time Remaining</Text>
              <Text style={styles.statValue}>{timeRemaining} min</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleReportDelay}>
              <View style={styles.actionIcon}>
                <Ionicons name="warning" size={24} color="white" />
              </View>
              <Text style={styles.actionText} numberOfLines={2}>Report Delay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePassengerCount}>
              <View style={styles.actionIcon}>
                <Ionicons name="people" size={24} color="white" />
              </View>
              <Text style={styles.actionText} numberOfLines={2}>Passenger Count</Text>
            </TouchableOpacity>
            {isTracking && (
              <TouchableOpacity style={styles.actionButton} onPress={moveToNextStop}>
                <View style={styles.actionIcon}>
                  <Ionicons name="arrow-forward" size={24} color="white" />
                </View>
                <Text style={styles.actionText} numberOfLines={2}>Next Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Route Progress Card - Show when trip is active */}
        {isTracking && selectedRoute && (
          <View style={styles.routeProgressCard}>
            <Text style={styles.routeProgressTitle}>Route Progress</Text>
            <View style={styles.progressInfo}>
              <View style={styles.currentStopInfo}>
                <Text style={styles.currentStopLabel}>Current Stop</Text>
                <Text style={styles.currentStopName}>
                  {selectedRoute.stops[currentStopIndex]?.name || 'Starting Point'}
                </Text>
                <Text style={styles.stopNumber}>
                  Stop {currentStopIndex + 1} of {selectedRoute.stops.length}
                </Text>
              </View>
              
              <View style={styles.nextStopInfo}>
                <Text style={styles.nextStopLabel}>Next Stop</Text>
                <Text style={styles.nextStopName}>
                  {selectedRoute.stops[currentStopIndex + 1]?.name || 'End of Route'}
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round((currentStopIndex / selectedRoute.stops.length) * 100)}% Complete
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(currentStopIndex / selectedRoute.stops.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Route Preview Card */}
        <View style={styles.routePreviewCard}>
          <Text style={styles.routePreviewTitle}>
            {isTracking ? 'Live Route Map' : 'Route Preview'}
          </Text>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              showsUserLocation
              showsMyLocationButton
              mapType="standard"
            >
              {/* Route Path - Show complete route with directions */}
              {isTracking && routeDirections.length > 0 && (
                <Polyline
                  coordinates={routeDirections}
                  strokeColor="#EC4899"
                  strokeWidth={6}
                  lineDashPattern={[5, 5]}
                />
              )}
              
              {/* Route stops with different colors based on progress */}
              {selectedRoute?.stops?.map((stop, index) => {
                let markerColor = "#8B5CF6"; // Default color
                let markerTitle = stop.name;
                
                if (isTracking) {
                  if (index < currentStopIndex) {
                    markerColor = "#10B981"; // Completed stops - green
                    markerTitle = `✓ ${stop.name}`;
                  } else if (index === currentStopIndex) {
                    markerColor = "#F59E0B"; // Current stop - orange
                    markerTitle = `📍 ${stop.name} (Current)`;
                  } else {
                    markerColor = "#6B7280"; // Upcoming stops - gray
                    markerTitle = `⏳ ${stop.name}`;
                  }
                }
                
                return (
                  <Marker
                    key={stop.id}
                    coordinate={{
                      latitude: stop.latitude,
                      longitude: stop.longitude,
                    }}
                    title={markerTitle}
                    description={`Stop ${index + 1} of ${selectedRoute.stops.length}`}
                    pinColor={markerColor}
                  />
                );
              })}
              
              {/* Driver's current location */}
              {isTracking && currentLocation && (
                <Marker
                  coordinate={{
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                  }}
                  title="Your Location"
                  description={`Next: ${nextStop?.name || 'Unknown'}`}
                >
                  <View style={styles.busMarker}>
                    <Ionicons name="bus" size={20} color="#fff" />
                  </View>
                </Marker>
              )}
              
              {/* Route progress line from current location to next stop */}
              {isTracking && currentLocation && nextStop && (
                <Polyline
                  coordinates={[
                    {
                      latitude: currentLocation.coords.latitude,
                      longitude: currentLocation.coords.longitude,
                    },
                    {
                      latitude: nextStop.latitude,
                      longitude: nextStop.longitude,
                    }
                  ]}
                  strokeColor="#F59E0B"
                  strokeWidth={3}
                  lineDashPattern={[10, 5]}
                />
              )}
            </MapView>
          </View>
        </View>

        {/* Trip Controls */}
        <View style={styles.tripControls}>
          {!isTracking ? (
            <TouchableOpacity
              style={styles.startTripButton}
              onPress={startTrip}
              disabled={!selectedRoute || isLoading}
            >
              <Text style={styles.startTripText}>
                {isLoading ? 'Starting...' : 'Start Trip'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopTripButton}
              onPress={stopTrip}
              disabled={isLoading}
            >
              <Text style={styles.stopTripText}>
                {isLoading ? 'Stopping...' : 'Stop Trip'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  menuButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  
  // Status Card
  statusCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Assigned Route Card
  assignedRouteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignedRouteLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  routeChangeButton: {
    padding: 8,
  },
  
  // Trip Statistics Card
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  // Quick Actions Card
  quickActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 4,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    minWidth: 0,
    maxWidth: (width - 80) / 3, // Ensure buttons fit on screen
    minHeight: 100,
    justifyContent: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Route Preview Card
  routePreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  
  // Trip Controls
  tripControls: {
    marginBottom: 20,
  },
  startTripButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startTripText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stopTripButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopTripText: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Route Progress Card
  routeProgressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currentStopInfo: {
    flex: 1,
    marginRight: 16,
  },
  currentStopLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentStopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stopNumber: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  nextStopInfo: {
    flex: 1,
  },
  nextStopLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  nextStopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  
  // Bus Marker (consolidated)
  busMarker: {
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Route selector styles
  routeDetails: {
    flex: 1,
  },
  routeDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  changeRouteText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: 4,
  },
  routeChangeButtonDisabled: {
    opacity: 0.5,
  },
  changeRouteTextDisabled: {
    color: '#999',
  },
  routePreview: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  routePreviewText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  routesList: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  routesListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  routeListItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedRouteItem: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  routeItemContent: {
    flex: 1,
  },
  routeItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  routeItemInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});