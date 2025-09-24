import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  Modal,
  Dimensions 
} from 'react-native';
import { Route, BusStop } from '../store/slices/busSlice';

const { width } = Dimensions.get('window');

interface DriverRouteSelectorProps {
  routes: Route[];
  selectedRoute: Route | null;
  onRouteSelect: (route: Route) => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function DriverRouteSelector({ 
  routes, 
  selectedRoute, 
  onRouteSelect, 
  isVisible, 
  onClose 
}: DriverRouteSelectorProps) {
  
  const renderRoute = ({ item }: { item: Route }) => (
    <TouchableOpacity 
      style={[
        styles.routeItem,
        selectedRoute?.id === item.id && styles.selectedRoute
      ]}
      onPress={() => {
        onRouteSelect(item);
        onClose();
      }}
    >
      <View style={styles.routeHeader}>
        <Text style={styles.routeName}>{item.name}</Text>
        {selectedRoute?.id === item.id && (
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        )}
      </View>
      
      {item.description && (
        <Text style={styles.routeDescription}>{item.description}</Text>
      )}
      
      <View style={styles.stopsInfo}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.stopsText}>
          {item.stops.length} stops
        </Text>
      </View>
      
      {item.stops.length > 0 && (
        <View style={styles.routePreview}>
          <Text style={styles.routePreviewText}>
            {item.stops[0].name} → {item.stops[item.stops.length - 1].name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Assigned Routes</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {routes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bus-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Routes Assigned</Text>
            <Text style={styles.emptyStateText}>
              You don't have any routes assigned yet. Please contact your supervisor.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              You have {routes.length} route{routes.length !== 1 ? 's' : ''} assigned to you
            </Text>
            
            <FlatList
              data={routes}
              renderItem={renderRoute}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.routesList}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  routesList: {
    padding: 20,
  },
  routeItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedRoute: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stopsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  routePreview: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  routePreviewText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});