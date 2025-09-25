import { api } from './client';

export type Trip = { id:number; tripId:string; routeName:string; driverName:string; startTime:string; endTime?:string|null; status:string; distance:number };

export async function listTrips(driverId?: number): Promise<Trip[]> {
  const res = await api.get('/authority/trips', { params: { driverId } });
  return res.data;
}

export async function deleteTrip(tripId: number): Promise<{ message: string }> {
  const res = await api.delete(`/authority/trips/${tripId}`);
  return res.data;
}


