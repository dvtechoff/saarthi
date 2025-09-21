import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { apiEndpoints } from '../../services/api';
import { AppDispatch, RootState } from '../../store';
import { setBuses, setError, setLoading, setSelectedBus } from '../../store/slices/busSlice';
import { setCurrentLocation, setPermissionGranted } from '../../store/slices/locationSlice';

const { width, height } = Dimensions.get('window');

export default function CommuterDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { buses, selectedBus, isLoading } = useSelector((state: RootState) => state.bus);
  const { currentLocation, permissionGranted } = useSelector((state: RootState) => state.location);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (permissionGranted && currentLocation) {
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      fetchNearbyBuses();
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
          'Location permission is required to show nearby buses.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      dispatch(setError('Failed to get location'));
    }
  };

  const fetchNearbyBuses = async () => {
    if (!currentLocation) return;

    try {
      dispatch(setLoading(true));
      const response = await apiEndpoints.getNearbyBuses(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        5000
      );
      // Handle different response formats
      const buses = response.data.buses || response.data;
      dispatch(setBuses(buses));
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      dispatch(setError('Failed to fetch nearby buses'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNearbyBuses();
    setRefreshing(false);
  };

  const handleBusPress = (bus: any) => {
    dispatch(setSelectedBus(bus));
  };

  const getBusColor = (occupancy: string) => {
    switch (occupancy) {
      case 'low': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'high': return '#e74c3c';
      default: return '#3498db';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Devansh Verma'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="#333" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Route/Stop"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation
          showsMyLocationButton
          onRegionChangeComplete={setRegion}
        >
          {buses.map((bus) => (
            <Marker
              key={bus.id}
              coordinate={{
                latitude: bus.latitude || bus.current_latitude,
                longitude: bus.longitude || bus.current_longitude,
              }}
              title={bus.routeName || `Route ${bus.bus_number}`}
              description={`${bus.currentStop || 'Current Stop'} → ${bus.nextStop || 'Next Stop'}`}
              pinColor={getBusColor(bus.occupancy)}
              onPress={() => handleBusPress(bus)}
            />
          ))}
        </MapView>
        
        {/* Map Controls */}
        <TouchableOpacity style={styles.mapControl}>
          <Ionicons name="locate" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Quick ETA Section */}
      <View style={styles.quickETASection}>
        <Text style={styles.sectionTitle}>Quick ETA</Text>
        <View style={styles.etaCards}>
          <View style={styles.etaCard}>
            <View style={styles.etaIconContainer}>
              <Ionicons name="home" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.etaInfo}>
              <Text style={styles.etaLabel}>Home</Text>
              <Text style={styles.etaTime}>15 min</Text>
              <Text style={styles.etaRoute}>Route 38</Text>
            </View>
          </View>
          
          <View style={styles.etaCard}>
            <View style={styles.etaIconContainer}>
              <Ionicons name="briefcase" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.etaInfo}>
              <Text style={styles.etaLabel}>Work</Text>
              <Text style={styles.etaTime}>25 min</Text>
              <Text style={styles.etaRoute}>Route 14</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Nearby Buses Section */}
      <View style={styles.nearbyBusesSection}>
        <Text style={styles.sectionTitle}>Nearby Buses</Text>
        <View style={styles.busesList}>
          {buses.length > 0 ? (
            buses.map((bus, index) => (
              <View key={bus.id || index} style={styles.busItem}>
                <View style={styles.busIconContainer}>
                  <Ionicons name="bus" size={20} color="#fff" />
                </View>
                <View style={styles.busInfo}>
                  <Text style={styles.busDestination}>
                    {bus.routeName || `Route ${bus.bus_number}`}
                  </Text>
                  <Text style={styles.busRoute}>
                    {bus.currentStop || 'Current Stop'} → {bus.nextStop || 'Next Stop'}
                  </Text>
                </View>
                <Text style={styles.busETA}>
                  {bus.occupancy === 'low' ? '5 min' : bus.occupancy === 'medium' ? '8 min' : '12 min'}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noBusesContainer}>
              <Ionicons name="bus-outline" size={48} color="#ccc" />
              <Text style={styles.noBusesText}>No buses nearby</Text>
              <Text style={styles.noBusesSubtext}>Try refreshing or check back later</Text>
            </View>
          )}
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
        disabled={isLoading}
      >
        <Ionicons 
          name="refresh" 
          size={20} 
          color={isLoading ? "#999" : "#8B5CF6"} 
        />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  
  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  
  // Map Styles
  mapContainer: {
    height: height * 0.35,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapControl: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Quick ETA Styles
  quickETASection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  etaCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  etaCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  etaInfo: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  etaRoute: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  // Nearby Buses Styles
  nearbyBusesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  busesList: {
    marginBottom: 20,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  busIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  busInfo: {
    flex: 1,
  },
  busDestination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  busRoute: {
    fontSize: 14,
    color: '#666',
  },
  busETA: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  
  // No Buses State
  noBusesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noBusesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noBusesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  
  // Refresh Button
  refreshButton: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});