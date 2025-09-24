import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken, getUser, setUser as setStoredUser } from '@/api/client';
import { login as apiLogin, getCurrentUser } from '@/api/auth';

type User = { id: string; email: string; role: string; name?: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => void;
};

const AuthContext = createContext<AuthContextValue>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      const storedUser = getUser();
      
      if (!token) {
        setLoading(false);
        return;
      }

      if (storedUser && storedUser.role === 'authority') {
        // We have stored user data, validate token is still valid
        try {
          const currentUser = await getCurrentUser();
          if (currentUser && currentUser.role === 'authority') {
            setUser(currentUser);
            setStoredUser(currentUser); // Update stored user data in case it changed
          } else {
            // Token invalid or user role changed
            setToken(null);
            setStoredUser(null);
          }
        } catch (error) {
          // Token is invalid
          setToken(null);
          setStoredUser(null);
        }
      } else {
        // No valid stored user data
        setToken(null);
        setStoredUser(null);
      }
      
      setLoading(false);
    };

    restoreSession();
  }, []);

  const signin = async (email: string, password: string) => {
    const { token, user } = await apiLogin(email, password);
    
    if (user?.role !== 'authority') {
      setToken(null);
      setStoredUser(null);
      throw new Error('Access denied: authority role required');
    }
    
    setUser(user); // Set in React state (localStorage storage is handled in auth.ts)
  };

  const signout = () => {
    setUser(null); // Clear React state
    setToken(null); // Clear token from localStorage
    setStoredUser(null); // Clear user from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


