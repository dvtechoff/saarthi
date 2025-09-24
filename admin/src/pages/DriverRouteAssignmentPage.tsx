import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  MapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { PageLoading } from '@/components/ui/Loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { listDrivers, getDriverRoutes, setDriverRoutes, setDriverCurrentRoute, type Driver } from '@/api/drivers';
import { listRoutes, type Route } from '@/api/routes';

export default function DriverRouteAssignmentPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [driversData, routesData] = await Promise.all([
        listDrivers(),
        listRoutes()
      ]);
      setDrivers(driversData);
      setRoutes(routesData);
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignRoutes = async () => {
    if (!selectedDriver) return;
    
    try {
      setAssignmentLoading(true);
      await setDriverRoutes(selectedDriver.id, selectedRoutes);
      
      // Update local state
      setDrivers(prev => prev.map(d => 
        d.id === selectedDriver.id 
          ? { ...d, assigned_routes: selectedRoutes }
          : d
      ));
      
      setShowAssignModal(false);
      setSelectedDriver(null);
      setSelectedRoutes([]);
    } catch (e: any) {
      setError(e?.message || 'Failed to assign routes');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleSetCurrentRoute = async (driverId: number, routeId: number | null) => {
    try {
      await setDriverCurrentRoute(driverId, routeId);
      
      // Update local state
      setDrivers(prev => prev.map(d => 
        d.id === driverId 
          ? { ...d, current_route_id: routeId }
          : d
      ));
    } catch (e: any) {
      setError(e?.message || 'Failed to update current route');
    }
  };

  const openAssignModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setSelectedRoutes(driver.assigned_routes || []);
    setShowAssignModal(true);
  };

  const getRouteNameById = (routeId: number) => {
    return routes.find(r => r.id === routeId)?.name || `Route ${routeId}`;
  };

  const toggleRouteSelection = (routeId: number) => {
    setSelectedRoutes(prev =>
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  if (loading) return <PageLoading message="Loading driver assignments..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={load}>Try Again</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Drivers',
      value: drivers.length.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: UserIcon
    },
    {
      title: 'Active Drivers',
      value: drivers.filter(d => d.is_active).length.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: CheckCircleIcon
    },
    {
      title: 'Assigned Drivers',
      value: drivers.filter(d => d.assigned_routes && d.assigned_routes.length > 0).length.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: MapIcon
    },
    {
      title: 'Currently Driving',
      value: drivers.filter(d => d.current_route_id).length.toString(),
      change: '+3%',
      changeType: 'positive' as const,
      icon: ClockIcon
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Route Assignment</h1>
          <p className="text-gray-600 mt-1">Manage route assignments for drivers</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Routes</TableHead>
                  <TableHead>Current Route</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {driver.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.is_active ? 'default' : 'secondary'}>
                        {driver.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {driver.assigned_routes && driver.assigned_routes.length > 0 ? (
                          driver.assigned_routes.slice(0, 2).map(routeId => (
                            <Badge key={routeId} variant="outline" className="mr-1 mb-1">
                              {getRouteNameById(routeId)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No routes assigned</span>
                        )}
                        {driver.assigned_routes && driver.assigned_routes.length > 2 && (
                          <Badge variant="outline" className="mr-1">
                            +{driver.assigned_routes.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {driver.current_route_id ? (
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">
                            {getRouteNameById(driver.current_route_id)}
                          </Badge>
                          <button
                            onClick={() => handleSetCurrentRoute(driver.id, null)}
                            className="text-red-600 hover:text-red-800"
                            title="Stop current route"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not driving</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignModal(driver)}
                        >
                          <MapIcon className="h-4 w-4 mr-1" />
                          Assign Routes
                        </Button>
                        {driver.assigned_routes && driver.assigned_routes.length > 0 && (
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                const routeId = e.target.value ? Number(e.target.value) : null;
                                handleSetCurrentRoute(driver.id, routeId);
                              }}
                              value={driver.current_route_id || ''}
                              className="text-sm px-2 py-1 border rounded"
                            >
                              <option value="">Select Route</option>
                              {driver.assigned_routes.map(routeId => (
                                <option key={routeId} value={routeId}>
                                  {getRouteNameById(routeId)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Route Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && selectedDriver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">
                  Assign Routes to {selectedDriver.name}
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Select routes to assign to this driver. The driver will be able to switch between these routes.
                  </p>
                  
                  {routes.filter(r => r.is_active).map((route) => (
                    <div
                      key={route.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedRoutes.includes(route.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleRouteSelection(route.id)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedRoutes.includes(route.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedRoutes.includes(route.id) && (
                          <CheckCircleIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{route.name}</div>
                        {route.description && (
                          <div className="text-sm text-gray-500">{route.description}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {route.stops.length} stops
                        </div>
                      </div>
                      <Badge variant="outline">
                        {route.stops.length} stops
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  {selectedRoutes.length} route{selectedRoutes.length !== 1 ? 's' : ''} selected
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignRoutes}
                    disabled={assignmentLoading}
                  >
                    {assignmentLoading ? (
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    Assign Routes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}