import { api, setToken } from './client';

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const { access_token, user } = res.data;
  setToken(access_token);
  return { token: access_token, user } as { token: string; user: any };
}


