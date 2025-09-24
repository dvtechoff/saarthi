import { api } from './client';

export type Bus = { id:number; bus_number:string; route_id:number|null; is_active:boolean; current_latitude?:number|null; current_longitude?:number|null };

export async function listBuses(): Promise<Bus[]> {
  const res = await api.get('/authority/buses/all');
  return res.data;
}

export async function createBus(input: { bus_number: string; route_id?: number | null }): Promise<Bus> {
  const res = await api.post('/authority/buses', input);
  return res.data;
}

export async function updateBus(busId: number, input: Partial<{ route_id: number | null; is_active: boolean }>): Promise<Bus> {
  const res = await api.patch(`/authority/buses/${busId}`, input);
  return res.data;
}


