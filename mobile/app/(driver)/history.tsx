import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { apiEndpoints } from '../../services/api';

export default function DriverProfile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [stats, setStats] = React.useState<{ totalTrips: number; kmDriven: number; passengers: number }>({ totalTrips: 0, kmDriven: 0, passengers: 0 });
  const [trips, setTrips] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logoutUser())
        }
      ]
    );
  };

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [s, h] = await Promise.all([
          apiEndpoints.getDriverStats(),
          apiEndpoints.getDriverTrips(10),
        ]);
        setStats(s.data);
        setTrips(Array.isArray(h.data) ? h.data : (h.data?.trips || []));
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={40} color="#8B5CF6" />
        </View>
        <Text style={styles.userName}>{user?.name || 'John Driver'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'driver@example.com'}</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active Driver</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats.totalTrips}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="speedometer" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{Math.round(stats.kmDriven)}</Text>
          <Text style={styles.statLabel}>KM Driven</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats.passengers}</Text>
          <Text style={styles.statLabel}>Passengers</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#8B5CF6" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
          <Text style={styles.menuText}>Trip History</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="trophy-outline" size={24} color="#8B5CF6" />
          <Text style={styles.menuText}>Achievements</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#8B5CF6" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Recent Trips Preview */}
      {trips.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Trips</Text>
          {trips.map((t, idx) => (
            <View key={t.id || idx} style={styles.recentItem}>
              <Ionicons name="bus-outline" size={20} color="#8B5CF6" />
              <Text style={styles.recentText}>{t.tripId} • {t.routeName} • {t.status}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    marginLeft: 8,
    fontWeight: '600',
  },
});