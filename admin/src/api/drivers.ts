import { api } from './client';

export type Driver = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
  is_active: boolean;
  current_route_id?: number | null;
  assigned_routes: number[];
};

export type DriverRouteAssignment = {
  driver_id: number;
  route_ids: number[];
  assigned_at: string;
  assigned_by: number;
};

export async function listDrivers(): Promise<Driver[]> {
  // Get all users and filter for drivers
  const res = await api.get('/authority/users');
  const users = res.data;
  
  // Filter for drivers and get their route assignments
  const drivers = users.filter((user: any) => user.role === 'driver');
  
  // For each driver, get their assigned routes
  const driversWithRoutes = await Promise.all(
    drivers.map(async (driver: any) => {
      try {
        const routesRes = await api.get(`/authority/drivers/${driver.id}/routes`);
        return {
          id: driver.id,
          name: driver.name || `Driver ${driver.id}`,
          email: driver.email,
          phone: driver.phone,
          is_active: driver.is_active,
          current_route_id: null, // This would need to be tracked separately
          assigned_routes: routesRes.data
        };
      } catch (error) {
        return {
          id: driver.id,
          name: driver.name || `Driver ${driver.id}`,
          email: driver.email,
          phone: driver.phone,
          is_active: driver.is_active,
          current_route_id: null,
          assigned_routes: []
        };
      }
    })
  );
  
  return driversWithRoutes;
}

export async function getDriver(driverId: number): Promise<Driver> {
  // Get user info
  const usersRes = await api.get('/authority/users');
  const driver = usersRes.data.find((user: any) => user.id === driverId && user.role === 'driver');
  
  if (!driver) {
    throw new Error('Driver not found');
  }
  
  // Get assigned routes
  try {
    const routesRes = await api.get(`/authority/drivers/${driverId}/routes`);
    return {
      id: driver.id,
      name: driver.name || `Driver ${driver.id}`,
      email: driver.email,
      phone: driver.phone,
      is_active: driver.is_active,
      current_route_id: null,
      assigned_routes: routesRes.data
    };
  } catch (error) {
    return {
      id: driver.id,
      name: driver.name || `Driver ${driver.id}`,
      email: driver.email,
      phone: driver.phone,
      is_active: driver.is_active,
      current_route_id: null,
      assigned_routes: []
    };
  }
}

export async function getDriverRoutes(driverId: number): Promise<number[]> {
  const res = await api.get(`/authority/drivers/${driverId}/routes`);
  return res.data;
}

export async function setDriverRoutes(driverId: number, routeIds: number[]): Promise<number[]> {
  const res = await api.put(`/authority/drivers/${driverId}/routes`, { route_ids: routeIds });
  return res.data;
}

export async function setDriverCurrentRoute(driverId: number, routeId: number | null): Promise<Driver> {
  // This endpoint doesn't exist yet in the backend, so we'll simulate it
  // In a real implementation, you'd need to add this endpoint to the backend
  const driver = await getDriver(driverId);
  return { ...driver, current_route_id: routeId };
}

export async function getDriverAssignedRoutes(driverId: number): Promise<{ routes: any[], current_route_id: number | null }> {
  // Get driver's assigned route IDs
  const routeIds = await getDriverRoutes(driverId);
  
  // Get all routes and filter for assigned ones
  const allRoutesRes = await api.get('/authority/routes/all');
  const assignedRoutes = allRoutesRes.data.filter((route: any) => routeIds.includes(route.id));
  
  return {
    routes: assignedRoutes,
    current_route_id: null // This would need to be tracked separately
  };
}


