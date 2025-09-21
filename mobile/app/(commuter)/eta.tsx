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

export default function CommuterMap() {
  const dispatch = useDispatch<AppDispatch>();
  const { buses, selectedBus, isLoading } = useSelector((state: RootState) => state.bus);
  const { currentLocation, permissionGranted } = useSelector((state: RootState) => state.location);
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
      dispatch(setBuses(response.data.buses));
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map View</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for routes or stops"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Map View */}
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
              latitude: bus.latitude,
              longitude: bus.longitude,
            }}
            title={bus.routeName}
            description={`${bus.currentStop} → ${bus.nextStop}`}
            pinColor={getBusColor(bus.occupancy)}
            onPress={() => handleBusPress(bus)}
          />
        ))}
      </MapView>

      {/* Bus List Panel */}
      <View style={styles.busListPanel}>
        <View style={styles.busListHeader}>
          <Text style={styles.busListTitle}>Nearby Buses</Text>
          <Text style={styles.busCount}>{buses.length} buses</Text>
        </View>
        
        <ScrollView
          style={styles.busList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {buses.map((bus) => (
            <TouchableOpacity 
              key={bus.id} 
              style={styles.busItem}
              onPress={() => handleBusPress(bus)}
            >
              <View style={styles.busIconContainer}>
                <Ionicons name="bus" size={20} color="#fff" />
              </View>
              <View style={styles.busInfo}>
                <Text style={styles.busStopName}>{bus.currentStop}</Text>
                <Text style={styles.busRouteName}>Route {bus.routeName}</Text>
              </View>
              <View style={styles.busETA}>
                <Text style={styles.etaText}>5 min</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Controls */}
      <TouchableOpacity style={styles.mapControl}>
        <Ionicons name="locate" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
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
  map: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  busListPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  busListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  busCount: {
    fontSize: 14,
    color: '#666',
  },
  busList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  busStopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  busRouteName: {
    fontSize: 14,
    color: '#666',
  },
  busETA: {
    alignItems: 'flex-end',
  },
  etaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  mapControl: {
    position: 'absolute',
    bottom: 200,
    right: 20,
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
});