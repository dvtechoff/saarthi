import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CommuterTickets() {
  const tickets = [
    {
      id: '1',
      route: 'Route 14',
      from: 'Connaught Place',
      to: 'Lajpat Nagar',
      date: '2025-09-19',
      time: '10:30 AM',
      price: '₹25',
      status: 'active'
    },
    {
      id: '2',
      route: 'Route 38',
      from: 'Home',
      to: 'Work',
      date: '2025-09-18',
      time: '9:15 AM',
      price: '₹20',
      status: 'used'
    },
    {
      id: '3',
      route: 'Route 5',
      from: 'Rajiv Chowk',
      to: 'Central Park',
      date: '2025-09-17',
      time: '2:45 PM',
      price: '₹30',
      status: 'expired'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#27ae60';
      case 'used': return '#666';
      case 'expired': return '#e74c3c';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'used': return 'checkmark-done-circle';
      case 'expired': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Tickets List */}
      <View style={styles.ticketsList}>
        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketInfo}>
                <Text style={styles.routeName}>{ticket.route}</Text>
                <Text style={styles.ticketDate}>{ticket.date} • {ticket.time}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                <Ionicons 
                  name={getStatusIcon(ticket.status)} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>{ticket.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.ticketDetails}>
              <View style={styles.routeInfo}>
                <View style={styles.routePoint}>
                  <View style={styles.routeDot} />
                  <Text style={styles.routeText}>{ticket.from}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotDestination]} />
                  <Text style={styles.routeText}>{ticket.to}</Text>
                </View>
              </View>
              
              <View style={styles.ticketPrice}>
                <Text style={styles.priceText}>{ticket.price}</Text>
              </View>
            </View>
            
            {ticket.status === 'active' && (
              <TouchableOpacity style={styles.useButton}>
                <Text style={styles.useButtonText}>Use Ticket</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle" size={24} color="#8B5CF6" />
          <Text style={styles.actionText}>Buy New Ticket</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="card" size={24} color="#8B5CF6" />
          <Text style={styles.actionText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  addButton: {
    padding: 8,
  },
  ticketsList: {
    padding: 20,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  ticketDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginRight: 12,
  },
  routeDotDestination: {
    backgroundColor: '#27ae60',
  },
  routeText: {
    fontSize: 16,
    color: '#333',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 3,
    marginBottom: 8,
  },
  ticketPrice: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  useButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
});
