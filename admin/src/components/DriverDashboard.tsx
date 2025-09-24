import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  StopIcon,
  EyeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { PageLoading } from '@/components/ui/Loading';
import { getDriverAssignedRoutes, setDriverCurrentRoute } from '@/api/drivers';
import { listRoutes, type Route, type Stop } from '@/api/routes';

interface DriverDashboardProps {
  driverId: number;
  driverName: string;
}

export default function DriverDashboard({ driverId, driverName }: DriverDashboardProps) {
  const [assignedRoutes, setAssignedRoutes] = useState<Route[]>([]);
  const [currentRouteId, setCurrentRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [switchingRoute, setSwitchingRoute] = useState(false);
  const [selectedRouteDetails, setSelectedRouteDetails] = useState<Route | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getDriverAssignedRoutes(driverId);
      setAssignedRoutes(data.routes);
      setCurrentRouteId(data.current_route_id);
    } catch (e: any) {
      setError(e?.message || 'Failed to load assigned routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [driverId]);

  const handleStartRoute = async (routeId: number) => {
    try {
      setSwitchingRoute(true);
      await setDriverCurrentRoute(driverId, routeId);
      setCurrentRouteId(routeId);
    } catch (e: any) {
      setError(e?.message || 'Failed to start route');
    } finally {
      setSwitchingRoute(false);
    }
  };

  const handleStopCurrentRoute = async () => {
    try {
      setSwitchingRoute(true);
      await setDriverCurrentRoute(driverId, null);
      setCurrentRouteId(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to stop route');
    } finally {
      setSwitchingRoute(false);
    }
  };

  const viewRouteDetails = (route: Route) => {
    setSelectedRouteDetails(route);
    setShowRouteModal(true);
  };

  if (loading) return <PageLoading message="Loading your routes..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Routes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={load}>Try Again</Button>
        </div>
      </div>
    );
  }

  const currentRoute = assignedRoutes.find(r => r.id === currentRouteId);
  const availableRoutes = assignedRoutes.filter(r => r.id !== currentRouteId);

  const stats = [
    {
      title: 'Assigned Routes',
      value: assignedRoutes.length.toString(),
      change: '',
      changeType: 'neutral' as const,
      icon: MapIcon
    },
    {
      title: 'Current Status',
      value: currentRoute ? 'Driving' : 'Available',
      change: '',
      changeType: currentRoute ? 'positive' as const : 'neutral' as const,
      icon: ClockIcon
    },
    {
      title: 'Active Route',
      value: currentRoute ? currentRoute.name : 'None',
      change: '',
      changeType: 'neutral' as const,
      icon: CheckCircleIcon
    },
    {
      title: 'Route Stops',
      value: currentRoute ? currentRoute.stops.length.toString() : '0',
      change: '',
      changeType: 'neutral' as const,
      icon: MapPinIcon
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {driverName}!</h1>
          <p className="text-gray-600 mt-1">Manage your assigned routes and current driving status</p>
        </div>
        {currentRoute && (
          <Button
            onClick={handleStopCurrentRoute}
            disabled={switchingRoute}
            variant="outline"
            className="flex items-center"
          >
            <StopIcon className="h-5 w-5 mr-2" />
            Stop Current Route
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Current Route */}
      {currentRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlayIcon className="h-5 w-5 mr-2 text-green-600" />
              Currently Driving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">{currentRoute.name}</h3>
                  {currentRoute.description && (
                    <p className="text-green-700 mt-1">{currentRoute.description}</p>
                  )}
                  <div className="flex items-center mt-2 space-x-4">
                    <Badge variant="default">
                      {currentRoute.stops.length} stops
                    </Badge>
                    <Badge variant="default">
                      Active Route
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewRouteDetails(currentRoute)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Routes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentRoute ? 'Switch to Another Route' : 'Your Assigned Routes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedRoutes.length === 0 ? (
            <div className="text-center py-8">
              <MapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Routes Assigned</h3>
              <p className="text-gray-600">
                Contact your authority to get route assignments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentRoute ? availableRoutes : assignedRoutes).map((route) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{route.name}</h3>
                      {route.description && (
                        <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                      )}
                    </div>
                    <Badge variant={route.is_active ? 'default' : 'secondary'}>
                      {route.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {route.stops.length} stops
                    </div>
                    {route.stops.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {route.stops[0].name} → {route.stops[route.stops.length - 1].name}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewRouteDetails(route)}
                      className="flex-1"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {route.is_active && (
                      <Button
                        size="sm"
                        onClick={() => handleStartRoute(route.id)}
                        disabled={switchingRoute}
                        className="flex-1"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Details Modal */}
      <AnimatePresence>
        {showRouteModal && selectedRouteDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRouteModal(false)}
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
                  {selectedRouteDetails.name} Details
                </h3>
                <button
                  onClick={() => setShowRouteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {selectedRouteDetails.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{selectedRouteDetails.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Route Stops ({selectedRouteDetails.stops.length})</h4>
                    <div className="space-y-2">
                      {selectedRouteDetails.stops
                        .sort((a, b) => a.sequence_order - b.sequence_order)
                        .map((stop, index) => (
                        <div key={stop.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {stop.sequence_order}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{stop.name}</div>
                            <div className="text-xs text-gray-500">
                              {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                            </div>
                          </div>
                          {index < selectedRouteDetails.stops.length - 1 && (
                            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                <Badge variant={selectedRouteDetails.is_active ? 'default' : 'secondary'}>
                  {selectedRouteDetails.is_active ? 'Active Route' : 'Inactive Route'}
                </Badge>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRouteModal(false)}
                  >
                    Close
                  </Button>
                  {selectedRouteDetails.is_active && selectedRouteDetails.id !== currentRouteId && (
                    <Button
                      onClick={() => {
                        handleStartRoute(selectedRouteDetails.id);
                        setShowRouteModal(false);
                      }}
                      disabled={switchingRoute}
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start This Route
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}