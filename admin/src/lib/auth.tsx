import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '@/api/client';
import { login as apiLogin } from '@/api/auth';

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
    // naive: if token exists, assume logged; server will enforce role on calls
    const token = getToken();
    if (!token) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const signin = async (email: string, password: string) => {
    const { token, user } = await apiLogin(email, password);
    if (user?.role !== 'authority') {
      setToken(null);
      throw new Error('Access denied: authority role required');
    }
    setUser(user);
  };

  const signout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


