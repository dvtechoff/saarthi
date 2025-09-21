import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { apiEndpoints } from '../../services/api';
import { RootState } from '../../store';

export default function CrowdFeedback() {
  const { buses } = useSelector((state: RootState) => state.bus);
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [occupancy, setOccupancy] = useState<'low' | 'medium' | 'high'>('low');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    checkOfflineStatus();
  }, []);

  const checkOfflineStatus = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('offline_feedback');
      setIsOffline(!!offlineData);
    } catch (error) {
      console.error('Error checking offline status:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBus) {
      Alert.alert('Error', 'Please select a bus');
      return;
    }

    const feedbackData = {
      busId: selectedBus,
      occupancy,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      setIsSubmitting(true);
      
      // Try to submit online first
      try {
        await apiEndpoints.submitFeedback(feedbackData);
        Alert.alert('Success', 'Feedback submitted successfully');
        
        // Clear form
        setSelectedBus('');
        setOccupancy('low');
        setComment('');
        
        // Remove from offline storage if it was there
        await AsyncStorage.removeItem('offline_feedback');
        setIsOffline(false);
      } catch (error) {
        // If online submission fails, store offline
        await storeOfflineFeedback(feedbackData);
        Alert.alert(
          'Offline Mode',
          'No internet connection. Feedback saved and will be submitted when online.'
        );
        setIsOffline(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeOfflineFeedback = async (feedbackData: any) => {
    try {
      const existingData = await AsyncStorage.getItem('offline_feedback');
      const offlineFeedbacks = existingData ? JSON.parse(existingData) : [];
      offlineFeedbacks.push(feedbackData);
      await AsyncStorage.setItem('offline_feedback', JSON.stringify(offlineFeedbacks));
    } catch (error) {
      console.error('Error storing offline feedback:', error);
    }
  };

  const getOccupancyColor = (level: string) => {
    switch (level) {
      case 'low': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'high': return '#e74c3c';
      default: return '#3498db';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crowd Feedback</Text>
        <Text style={styles.subtitle}>Help other commuters by sharing occupancy information</Text>
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>📡 Offline Mode - Data will sync when online</Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        {/* Bus Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Bus *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {buses.map((bus) => (
              <TouchableOpacity
                key={bus.id}
                style={[
                  styles.busCard,
                  selectedBus === bus.id && styles.busCardSelected
                ]}
                onPress={() => setSelectedBus(bus.id)}
              >
                <Text style={[
                  styles.busName,
                  selectedBus === bus.id && styles.busNameSelected
                ]}>
                  {bus.routeName}
                </Text>
                <Text style={styles.busId}>ID: {bus.id}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Occupancy Level */}
        <View style={styles.section}>
          <Text style={styles.label}>Crowd Level *</Text>
          <View style={styles.occupancyContainer}>
            {(['low', 'medium', 'high'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.occupancyButton,
                  { backgroundColor: getOccupancyColor(level) },
                  occupancy === level && styles.occupancyButtonSelected
                ]}
                onPress={() => setOccupancy(level)}
              >
                <Text style={[
                  styles.occupancyText,
                  occupancy === level && styles.occupancyTextSelected
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.label}>Additional Comments (Optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Any additional information about the bus..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedBus || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedBus || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isOffline ? 'Save Offline' : 'Submit Feedback'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Crowd Level Guide:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#27ae60' }]} />
            <Text style={styles.legendText}>Low: Plenty of seats available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f39c12' }]} />
            <Text style={styles.legendText}>Medium: Some seats available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
            <Text style={styles.legendText}>High: Standing room only</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    marginTop: 4,
  },
  offlineIndicator: {
    backgroundColor: '#f39c12',
    padding: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  busCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 120,
  },
  busCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#ecf0f1',
  },
  busName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  busNameSelected: {
    color: '#3498db',
  },
  busId: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  occupancyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  occupancyButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  occupancyButtonSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  occupancyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  occupancyTextSelected: {
    textDecorationLine: 'underline',
  },
  commentInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  legend: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});