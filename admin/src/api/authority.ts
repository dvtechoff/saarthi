import { api } from './client';

export async function getAnalytics() {
  const res = await api.get('/authority/analytics');
  return res.data as {
    totalTrips: number;
    activeTrips: number;
    totalBuses: number;
    activeBuses: number;
    totalFeedbacks: number;
    averageSpeed: number;
    onTimeRate: number;
  };
}


