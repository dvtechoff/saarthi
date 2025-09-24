export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL as string
) || 'http://localhost:8000';

export const API_V1 = `${API_BASE_URL}/api/v1`;


