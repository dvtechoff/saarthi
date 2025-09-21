import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';
import { wsService } from '../services/websocket';
import { RootState, store } from '../store';
import { loadStoredAuth } from '../store/slices/authSlice';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Loading screen component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function RootLayoutNav() {
  const authState = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, user, isLoading } = authState || { isAuthenticated: false, user: null, isLoading: true };
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Load stored authentication
    store.dispatch(loadStoredAuth());
  }, []);

  useEffect(() => {
    // Connect to WebSocket when authenticated (using polling transport)
    if (isAuthenticated && user) {
      const token = store.getState().auth.token;
      if (token) {
        try {
          wsService.connect(token);
        } catch (error) {
          console.warn('WebSocket connection failed:', error);
          // Continue without WebSocket - app will work without real-time updates
        }
      }
    } else {
      wsService.disconnect();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isLoading) return;
    
    const currentRoot = segments[0];
    
    if (!isAuthenticated) {
      if (currentRoot !== '(auth)') router.replace('/(auth)/login');
      return;
    }
    
    if (user?.role === 'commuter') {
      if (currentRoot !== '(commuter)') router.replace('/(commuter)');
      return;
    }
    if (user?.role === 'driver') {
      if (currentRoot !== '(driver)') router.replace('/(driver)');
      return;
    }
    if (user?.role === 'authority') {
      if (currentRoot !== '(authority)') router.replace('/(authority)');
      return;
    }
  }, [isAuthenticated, user?.role, isLoading, segments, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(commuter)" />
      <Stack.Screen name="(driver)" />
      <Stack.Screen name="(authority)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

