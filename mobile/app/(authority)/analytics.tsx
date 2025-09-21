import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { apiEndpoints } from '../../services/api';

interface AnalyticsData {
  trips: number;
  delays: number;
  feedbacks: number;
  avgSpeed: number;
  onTimeRate: number;
  totalDistance: number;
}

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await apiEndpoints.getAnalytics();
      // Mock additional data for demonstration
      const mockData: AnalyticsData = {
        trips: response.data.trips || 150,
        delays: response.data.delays || 5,
        feedbacks: response.data.feedbacks || 23,
        avgSpeed: 28.5,
        onTimeRate: 94.2,
        totalDistance: 1250.8,
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: string; 
    color: string; 
    subtitle?: string; 
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>System performance overview</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {analytics ? (
            <>
              {/* Key Metrics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.metricsGrid}>
                  <StatCard
                    title="Total Trips"
                    value={analytics.trips}
                    icon="bus"
                    color="#27ae60"
                    subtitle="Today"
                  />
                  <StatCard
                    title="Delays"
                    value={analytics.delays}
                    icon="time"
                    color="#e74c3c"
                    subtitle="Incidents"
                  />
                  <StatCard
                    title="Feedbacks"
                    value={analytics.feedbacks}
                    icon="people"
                    color="#3498db"
                    subtitle="Received"
                  />
                  <StatCard
                    title="On-Time Rate"
                    value={`${analytics.onTimeRate}%`}
                    icon="checkmark-circle"
                    color="#f39c12"
                    subtitle="Performance"
                  />
                </View>
              </View>

              {/* Performance Stats */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.performanceContainer}>
                  <View style={styles.performanceItem}>
                    <View style={styles.performanceIcon}>
                      <Ionicons name="speedometer" size={20} color="#27ae60" />
                    </View>
                    <View style={styles.performanceInfo}>
                      <Text style={styles.performanceLabel}>Average Speed</Text>
                      <Text style={styles.performanceValue}>{analytics.avgSpeed} km/h</Text>
                    </View>
                  </View>
                  
                  <View style={styles.performanceItem}>
                    <View style={styles.performanceIcon}>
                      <Ionicons name="location" size={20} color="#3498db" />
                    </View>
                    <View style={styles.performanceInfo}>
                      <Text style={styles.performanceLabel}>Total Distance</Text>
                      <Text style={styles.performanceValue}>{analytics.totalDistance} km</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Charts Placeholder */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trends</Text>
                <View style={styles.chartPlaceholder}>
                  <Ionicons name="bar-chart" size={48} color="#bdc3c7" />
                  <Text style={styles.chartText}>Performance Charts</Text>
                  <Text style={styles.chartSubtext}>Detailed analytics coming soon</Text>
                </View>
              </View>

              {/* Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryText}>
                    System is performing well with {analytics.onTimeRate}% on-time rate. 
                    {analytics.delays <= 5 ? ' Low delay incidents reported.' : ' Some delays reported, monitoring required.'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="analytics-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>No data available</Text>
              <Text style={styles.emptySubtitle}>Analytics data will appear here</Text>
            </View>
          )}
        </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  performanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  performanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
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
});