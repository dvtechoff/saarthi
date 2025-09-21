// Mock authentication service for development/testing
// Replace this with real API calls when backend is ready

export interface MockUser {
  id: string;
  email: string;
  role: 'commuter' | 'driver';
  name?: string;
  phone?: string;
}

export interface MockAuthResponse {
  user: MockUser;
  token: string;
}

// Mock users database
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'commuter@test.com',
    role: 'commuter',
    name: 'Test Commuter',
    phone: '+1234567890'
  },
  {
    id: '2',
    email: 'driver@test.com',
    role: 'driver',
    name: 'Test Driver',
    phone: '+1234567891'
  }
];

// Mock authentication functions
export const mockLogin = async (email: string, password: string): Promise<MockAuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find user by email
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // For demo purposes, accept any password
  if (!password || password.length < 3) {
    throw new Error('Password too short');
  }
  
  return {
    user,
    token: `mock_token_${user.id}_${Date.now()}`
  };
};

export const mockRegister = async (userData: {
  email: string;
  password: string;
  role: 'commuter' | 'driver';
  name?: string;
  phone?: string;
}): Promise<MockAuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Create new user
  const newUser: MockUser = {
    id: `mock_${Date.now()}`,
    email: userData.email,
    role: userData.role,
    name: userData.name,
    phone: userData.phone
  };
  
  mockUsers.push(newUser);
  
  return {
    user: newUser,
    token: `mock_token_${newUser.id}_${Date.now()}`
  };
};

// Mock API endpoints for testing
export const mockApiEndpoints = {
  login: mockLogin,
  register: mockRegister,
  
  // Mock other endpoints
  getNearbyBuses: async () => ({
    data: {
      buses: [
        {
          id: 'bus_1',
          routeId: 'route_1',
          routeName: '14',
          currentStop: 'Market St & 5th St',
          nextStop: 'Mission St & 6th St',
          latitude: 28.6139,
          longitude: 77.209,
          heading: 45,
          speed: 25,
          occupancy: 'medium',
          lastUpdated: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'bus_2',
          routeId: 'route_2',
          routeName: '38',
          currentStop: 'Geary Blvd & 20th Ave',
          nextStop: 'Geary Blvd & 22nd Ave',
          latitude: 28.6149,
          longitude: 77.219,
          heading: 90,
          speed: 30,
          occupancy: 'low',
          lastUpdated: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'bus_3',
          routeId: 'route_3',
          routeName: '30',
          currentStop: 'Union Square',
          nextStop: 'Chinatown',
          latitude: 28.6159,
          longitude: 77.229,
          heading: 135,
          speed: 20,
          occupancy: 'high',
          lastUpdated: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'bus_4',
          routeId: 'route_4',
          routeName: '49',
          currentStop: 'Mission District',
          nextStop: 'Noe Valley',
          latitude: 28.6129,
          longitude: 77.199,
          heading: 180,
          speed: 35,
          occupancy: 'medium',
          lastUpdated: new Date().toISOString(),
          isActive: true
        }
      ]
    }
  }),
  
  getBusETA: async (busId: string, stopId: string) => ({
    data: {
      eta: '5 minutes'
    }
  }),
  
  submitFeedback: async (data: any) => ({
    data: { success: true }
  }),
  
  getAssignedRoutes: async () => ({
    data: {
      routes: [
        {
          id: 'route_1',
          name: 'Route 101',
          color: '#3498db',
          stops: [
            { id: 'stop_1', name: 'Central Station', latitude: 28.6139, longitude: 77.209, sequence: 1 },
            { id: 'stop_2', name: 'Downtown Mall', latitude: 28.6149, longitude: 77.219, sequence: 2 }
          ]
        }
      ]
    }
  })
};
