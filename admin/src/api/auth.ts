import { api, setToken, setUser } from './client';

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const { access_token, user } = res.data;
  setToken(access_token);
  setUser(user);
  return { token: access_token, user } as { token: string; user: any };
}

export async function getCurrentUser() {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (error) {
    throw error;
  }
}


