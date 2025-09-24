import { api } from './client';

export type Stop = { id:number; name:string; latitude:number; longitude:number; sequence_order:number };
export type Route = { id:number; name:string; description?:string|null; is_active:boolean; stops: Stop[] };

export async function listRoutes(): Promise<Route[]> { 
  const res = await api.get('/authority/routes/all'); 
  return res.data; 
}

export async function createRoute(input: { name:string; description?:string|null }): Promise<Route> { 
  const res = await api.post('/authority/routes', input); 
  return res.data; 
}

export async function updateRoute(id:number, input: Partial<{ name:string; description:string|null; is_active:boolean }>): Promise<Route> { 
  const res = await api.patch(`/authority/routes/${id}`, input); 
  return res.data; 
}

export async function createStop(input: { route_id:number; name:string; latitude:number; longitude:number; sequence_order:number }): Promise<Stop> { 
  const res = await api.post('/authority/stops', input); 
  return res.data; 
}

export async function updateStop(id:number, input: Partial<{ name:string; latitude:number; longitude:number; sequence_order:number }>): Promise<Stop> { 
  const res = await api.patch(`/authority/stops/${id}`, input); 
  return res.data; 
}


