import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { Route } from '../../store/slices/busSlice';

export default function DriverMap() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation, isTracking } = useSelector((state: RootState) => state.location);
  const { selectedRoute, routes } = useSelector((state: RootState) => state.bus);
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // Route tracking state
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [routeDirections, setRouteDirections] = useState([]);
  const [nextStop, setNextStop] = useState(null);

  useEffect(() => {
    if (currentLocation) {
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation]);

  useEffect(() => {
    if (selectedRoute && isTracking) {
      updateMapRegionForRoute(selectedRoute);
      setCurrentStopIndex(0);
      setNextStop(selectedRoute.stops[0]);
      const directions = generateRouteDirections(selectedRoute);
      setRouteDirections(directions);
    }
  }, [selectedRoute, isTracking]);

  const updateMapRegionForRoute = (route: Route) => {
    if (!route.stops || route.stops.length === 0) return;

    const stops = Array.isArray(route.stops) ? route.stops : [];
    if (stops.length === 0) return;

    const latitudes = stops.map(stop => stop.latitude);
    const longitudes = stops.map(stop => stop.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latDelta = (maxLat - minLat) * 1.2;
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
      
      const steps = 10;
      for (let j = 0; j <= steps; j++) {
        const ratio = j / steps;
        const lat = currentStop.latitude + (nextStop.latitude - currentStop.latitude) * ratio;
        const lng = currentStop.longitude + (nextStop.longitude - currentStop.longitude) * ratio;
        
        const curveOffset = Math.sin(ratio * Math.PI) * 0.001;
        directions.push({
          latitude: lat + curveOffset,
          longitude: lng + curveOffset * 0.5,
        });
      }
    }
    return directions;
  };

  const moveToNextStop = () => {
    if (!selectedRoute || currentStopIndex >= selectedRoute.stops.length - 1) {
      Alert.alert('Route Complete', 'You have reached the end of the route!');
      return;
    }

    const nextIndex = currentStopIndex + 1;
    setCurrentStopIndex(nextIndex);
    setNextStop(selectedRoute.stops[nextIndex + 1]);
    
    Alert.alert(
      'Stop Reached', 
      `Arrived at ${selectedRoute.stops[currentStopIndex]?.name}\nNext: ${selectedRoute.stops[nextIndex]?.name || 'End of Route'}`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Route Map</Text>
        <Text style={styles.subtitle}>
          {isTracking ? 'Tracking active' : 'Start trip to begin tracking'}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation
          showsMyLocationButton
          followsUserLocation={isTracking}
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

      {!isTracking && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Ionicons name="play-circle-outline" size={48} color="#bdc3c7" />
            <Text style={styles.overlayTitle}>Start Trip</Text>
            <Text style={styles.overlaySubtitle}>
              Go to Dashboard to start tracking your route
            </Text>
          </View>
        </View>
      )}

      {isTracking && selectedRoute && (
        <View style={styles.trackingInfo}>
          <View style={styles.trackingItem}>
            <Ionicons name="location" size={16} color="#27ae60" />
            <Text style={styles.trackingText}>Live tracking active</Text>
          </View>
          <View style={styles.trackingItem}>
            <Ionicons name="flag" size={16} color="#F59E0B" />
            <Text style={styles.trackingText}>
              Stop {currentStopIndex + 1} of {selectedRoute.stops.length}
            </Text>
          </View>
          <View style={styles.trackingItem}>
            <Ionicons name="speedometer" size={16} color="#3498db" />
            <Text style={styles.trackingText}>
              {currentLocation?.coords.speed ? `${Math.round(currentLocation.coords.speed * 3.6)} km/h` : 'N/A'}
            </Text>
          </View>
          <TouchableOpacity style={styles.nextStopButton} onPress={moveToNextStop}>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
            <Text style={styles.nextStopText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
  },
  overlayContent: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  trackingInfo: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
    fontWeight: '500',
  },
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
  nextStopButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  nextStopText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
