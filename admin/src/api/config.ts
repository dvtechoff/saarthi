// Production Railway URL - UPDATE THIS AFTER DEPLOYING TO RAILWAY
const PRODUCTION_API_URL = 'https://saarthi-track.up.railway.app';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL as string
) || (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:8000');

export const API_V1 = `${API_BASE_URL}/api/v1`;


