import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';
import { wsService } from '../services/websocket';
import { RootState, store } from '../store';
import { loadStoredAuth } from '../store/slices/authSlice';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
    // Temporarily disabled WebSocket connections to prevent errors
    // TODO: Re-enable when WebSocket server is properly configured
    /*
    if (isAuthenticated && user) {
      const token = store.getState().auth.token;
      if (token) {
        wsService.connect(token);
      }
    } else {
      wsService.disconnect();
    }
    */
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(commuter)" />
      <Stack.Screen name="(driver)" />
      <Stack.Screen name="(authority)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
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

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

