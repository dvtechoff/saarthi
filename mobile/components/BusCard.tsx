import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Bus } from '../store/slices/busSlice';

interface BusCardProps {
  bus: Bus;
  onPress: () => void;
  isSelected?: boolean;
}

export default function BusCard({ bus, onPress, isSelected = false }: BusCardProps) {
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.routeName}>{bus.routeName}</Text>
        <View style={[
          styles.occupancyBadge,
          { backgroundColor: getOccupancyColor(bus.occupancy) }
        ]}>
          <Text style={styles.occupancyText}>
            {getOccupancyText(bus.occupancy)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.currentStop}>
        Now at: {bus.currentStop}
      </Text>
      
      <Text style={styles.nextStop}>
        Next: {bus.nextStop}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.speed}>
          {Math.round(bus.speed)} km/h
        </Text>
        <Text style={styles.lastUpdated}>
          {new Date(bus.lastUpdated).toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  occupancyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occupancyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  currentStop: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  nextStop: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speed: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
