import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSelector } from 'react-redux';
import { apiEndpoints } from '../../services/api';
import { RootState } from '../../store';

interface ActiveBus {
  id: string;
  routeName: string;
  currentStop: string;
  nextStop: string;
  occupancy: 'low' | 'medium' | 'high';
  speed: number;
  lastUpdated: string;
  driverName?: string;
}

export default function AuthorityDashboard() {
  const { buses } = useSelector((state: RootState) => state.bus);
  const [activeBuses, setActiveBuses] = useState<ActiveBus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActiveBuses();
  }, []);

  const fetchActiveBuses = async () => {
    setIsLoading(true);
    try {
      const response = await apiEndpoints.getAllBuses();
      // Convert bus data to active bus format
      const activeBusesData: ActiveBus[] = response.data.buses.map((bus: any) => ({
        id: bus.id,
        routeName: bus.routeName,
        currentStop: bus.currentStop,
        nextStop: bus.nextStop,
        occupancy: bus.occupancy,
        speed: bus.speed,
        lastUpdated: bus.lastUpdated,
        driverName: `Driver ${bus.id.slice(-4)}`,
      }));
      setActiveBuses(activeBusesData);
    } catch (error) {
      console.error('Error fetching active buses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveBuses();
    setRefreshing(false);
  };

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case 'low': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'high': return '#e74c3c';
      default: return '#3498db';
    }
  };

  const getOccupancyText = (occupancy: string) => {
    switch (occupancy) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      default: return 'Unknown';
    }
  };

  const renderBusItem = ({ item }: { item: ActiveBus }) => (
    <View style={styles.busCard}>
      <View style={styles.busHeader}>
        <View style={styles.routeContainer}>
          <View style={styles.routeNumber}>
            <Text style={styles.routeText}>{item.routeName}</Text>
          </View>
          <View style={styles.busId}>
            <Text style={styles.busIdText}>#{item.id.slice(-4)}</Text>
          </View>
        </View>
        <View style={styles.occupancyContainer}>
          <View style={[styles.occupancyBadge, { backgroundColor: getOccupancyColor(item.occupancy) }]}>
            <Text style={styles.occupancyText}>{getOccupancyText(item.occupancy)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.busDetails}>
        <View style={styles.stopInfo}>
          <View style={styles.currentStop}>
            <Ionicons name="location" size={16} color="#27ae60" />
            <Text style={styles.stopLabel}>Current:</Text>
            <Text style={styles.stopName}>{item.currentStop}</Text>
          </View>
          <View style={styles.nextStop}>
            <Ionicons name="arrow-forward" size={16} color="#666" />
            <Text style={styles.stopLabel}>Next:</Text>
            <Text style={styles.stopName}>{item.nextStop}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="speedometer" size={16} color="#666" />
            <Text style={styles.statText}>{item.speed} km/h</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.statText}>{item.driverName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.lastUpdated}>
        <Ionicons name="time" size={12} color="#999" />
        <Text style={styles.lastUpdatedText}>
          Updated {new Date(item.lastUpdated).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Buses</Text>
        <Text style={styles.subtitle}>Real-time monitoring dashboard</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeBuses.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {activeBuses.filter(bus => bus.occupancy === 'high').length}
            </Text>
            <Text style={styles.statLabel}>Crowded</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {activeBuses.filter(bus => bus.speed > 30).length}
            </Text>
            <Text style={styles.statLabel}>Moving</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Loading active buses...</Text>
        </View>
      ) : (
        <FlatList
          data={activeBuses}
          keyExtractor={(item) => item.id}
          renderItem={renderBusItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bus-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>No active buses</Text>
              <Text style={styles.emptySubtitle}>No buses are currently running</Text>
            </View>
          }
        />
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
    backgroundColor: '#2c3e50',
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
    color: '#bdc3c7',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  busCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeNumber: {
    backgroundColor: '#27ae60',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  routeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  busId: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  busIdText: {
    color: '#2c3e50',
    fontSize: 12,
    fontWeight: '600',
  },
  occupancyContainer: {
    alignItems: 'flex-end',
  },
  occupancyBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  occupancyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  busDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopInfo: {
    flex: 1,
  },
  currentStop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextStop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 6,
    marginRight: 4,
  },
  stopName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 8,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});