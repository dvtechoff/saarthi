import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiEndpoints } from '../services/api';
import { Bus } from '../store/slices/busSlice';

interface ETACardProps {
  bus: Bus;
  userLocation: Location.LocationObject | null;
  onClose: () => void;
}

export default function ETACard({ bus, userLocation, onClose }: ETACardProps) {
  const [eta, setEta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      // Find nearest stop to user location
      // For now, use the next stop as default
      setSelectedStop(bus.nextStop);
      fetchETA(bus.nextStop);
    }
  }, [bus, userLocation]);

  const fetchETA = async (stopId: string) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getBusETA(bus.id, stopId);
      setEta(response.data.eta);
    } catch (error: any) {
      console.error('Error fetching ETA:', error);
      Alert.alert('Error', 'Failed to fetch ETA');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSelect = (stopId: string) => {
    setSelectedStop(stopId);
    fetchETA(stopId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ETA Information</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.busInfo}>
        <Text style={styles.routeName}>{bus.routeName}</Text>
        <Text style={styles.busId}>Bus ID: {bus.id}</Text>
      </View>

      <View style={styles.stopInfo}>
        <Text style={styles.stopLabel}>Current Stop:</Text>
        <Text style={styles.stopName}>{bus.currentStop}</Text>
      </View>

      <View style={styles.stopInfo}>
        <Text style={styles.stopLabel}>Next Stop:</Text>
        <Text style={styles.stopName}>{bus.nextStop}</Text>
      </View>

      <View style={styles.etaSection}>
        <Text style={styles.etaLabel}>Estimated Time of Arrival:</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#3498db" />
        ) : (
          <Text style={styles.etaValue}>
            {eta || 'Not available'}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => selectedStop && fetchETA(selectedStop)}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>Refresh ETA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  busInfo: {
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  busId: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  stopInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stopLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: 100,
  },
  stopName: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  etaSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  etaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  actions: {
    marginTop: 16,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
