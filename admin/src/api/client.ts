import axios from 'axios';
import { API_V1 } from './config';

const tokenKey = 'admin_token';
const userKey = 'admin_user';

export function setToken(token: string | null) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

export function getToken() {
  return localStorage.getItem(tokenKey);
}

export function setUser(user: any) {
  if (user) localStorage.setItem(userKey, JSON.stringify(user));
  else localStorage.removeItem(userKey);
}

export function getUser() {
  const userData = localStorage.getItem(userKey);
  return userData ? JSON.parse(userData) : null;
}

export const api = axios.create({ baseURL: API_V1 });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      setToken(null);
      setUser(null);
      // let guard handle redirect
    }
    return Promise.reject(err);
  }
);


