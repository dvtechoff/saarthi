import { api } from './client';

export type User = { id: number; email: string; role: string; name?: string; phone?: string; is_active: boolean };

export async function listUsers(): Promise<User[]> {
  const res = await api.get('/authority/users');
  return res.data;
}

export async function createUser(input: { email: string; password: string; role: string; name?: string; phone?: string }): Promise<User> {
  const res = await api.post('/authority/users', input);
  return res.data;
}

export async function updateUser(userId: number, input: Partial<{ role: string; name: string; phone: string; is_active: boolean }>): Promise<User> {
  const res = await api.patch(`/authority/users/${userId}`, input);
  return res.data;
}

export async function deleteUser(userId: number): Promise<{ message: string }> {
  const res = await api.delete(`/authority/users/${userId}`);
  return res.data;
}


