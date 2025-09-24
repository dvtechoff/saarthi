import axios from 'axios';
import { API_V1 } from './config';

const tokenKey = 'admin_token';

export function setToken(token: string | null) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

export function getToken() {
  return localStorage.getItem(tokenKey);
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
      // let guard handle redirect
    }
    return Promise.reject(err);
  }
);


