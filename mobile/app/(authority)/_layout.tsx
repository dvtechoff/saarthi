import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AuthorityTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard', 
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="analytics" 
        options={{ 
          title: 'Analytics', 
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" color={color} size={size} /> 
        }} 
      />
    </Tabs>
  );
}