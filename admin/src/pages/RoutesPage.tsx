import { useEffect, useState } from 'react';
import { Route, Stop, createRoute, createStop, listRoutes, updateRoute } from '@/api/routes';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/ui/Loading';
import {
  MapPinIcon,
  PlusIcon,
  MapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [routeForm, setRouteForm] = useState<{ name: string; description: string }>({
    name: '',
    description: '',
  });
  const [stopForm, setStopForm] = useState<{
    route_id: number;
    name: string;
    latitude: string;
    longitude: string;
    sequence_order: string;
  }>({ route_id: 0, name: '', latitude: '', longitude: '', sequence_order: '1' });

  const load = async () => {
    try {
      setLoading(true);
      const data = await listRoutes();
      setRoutes(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoute({ name: routeForm.name, description: routeForm.description });
      setRouteForm({ name: '', description: '' });
      setShowCreateRoute(false);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to create route');
    }
  };

  const submitStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStop({
        route_id: Number(stopForm.route_id),
        name: stopForm.name,
        latitude: Number(stopForm.latitude),
        longitude: Number(stopForm.longitude),
        sequence_order: Number(stopForm.sequence_order),
      });
      setStopForm({ route_id: 0, name: '', latitude: '', longitude: '', sequence_order: '1' });
      setShowAddStop(false);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to create stop');
    }
  };

  const toggleRoute = async (route: Route) => {
    try {
      await updateRoute(route.id, { is_active: !route.is_active });
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to update route');
    }
  };

  if (loading) return <PageLoading message="Loading routes..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Routes</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={load}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MapIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
            <p className="text-gray-600">Manage bus routes and stops</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button onClick={() => setShowAddStop(true)} variant="outline" size="sm">
            <MapPinIcon className="h-4 w-4 mr-2" />
            Add Stop
          </Button>
          <Button onClick={() => setShowCreateRoute(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{routes.filter(r => r.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Stops</p>
                <p className="text-2xl font-bold">
                  {routes.reduce((total, route) => total + (route.stops?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Coverage</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route, index) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <CardDescription>
                        {route.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={route.is_active ? 'success' : 'destructive'}>
                    {route.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Route ID</span>
                    <span className="font-medium">#{route.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Stops</span>
                    <span className="font-medium">{route.stops?.length || 0}</span>
                  </div>

                  {route.stops && route.stops.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Stops</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {route.stops
                          .sort((a, b) => a.sequence_order - b.sequence_order)
                          .map((stop: Stop) => (
                            <div
                              key={stop.id}
                              className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="w-6 h-6 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium">
                                {stop.sequence_order}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{stop.name}</p>
                                <p className="text-gray-500 text-xs">
                                  {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    <Button
                      onClick={() => toggleRoute(route)}
                      variant={route.is_active ? 'destructive' : 'success'}
                      size="sm"
                    >
                      {route.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {routes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-500 mb-4">Create your first route to get started</p>
            <Button onClick={() => setShowCreateRoute(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create First Route
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Route Modal */}
      {showCreateRoute && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Route</CardTitle>
                <CardDescription>Add a new bus route to your network</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitRoute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Route Name
                    </label>
                    <Input
                      required
                      value={routeForm.name}
                      onChange={(e) => setRouteForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Downtown - Airport"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <Input
                      value={routeForm.description}
                      onChange={(e) => setRouteForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of the route"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateRoute(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Route</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Add Stop Modal */}
      {showAddStop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <Card>
              <CardHeader>
                <CardTitle>Add Stop to Route</CardTitle>
                <CardDescription>Add a new stop to an existing route</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitStop} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Route
                    </label>
                    <select
                      required
                      value={stopForm.route_id}
                      onChange={(e) => setStopForm(f => ({ ...f, route_id: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={0} disabled>
                        Choose a route
                      </option>
                      {routes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stop Name
                    </label>
                    <Input
                      required
                      value={stopForm.name}
                      onChange={(e) => setStopForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Main Street Station"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <Input
                        required
                        type="number"
                        step="any"
                        value={stopForm.latitude}
                        onChange={(e) => setStopForm(f => ({ ...f, latitude: e.target.value }))}
                        placeholder="12.9716"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <Input
                        required
                        type="number"
                        step="any"
                        value={stopForm.longitude}
                        onChange={(e) => setStopForm(f => ({ ...f, longitude: e.target.value }))}
                        placeholder="77.5946"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sequence Order
                    </label>
                    <Input
                      required
                      type="number"
                      min="1"
                      value={stopForm.sequence_order}
                      onChange={(e) => setStopForm(f => ({ ...f, sequence_order: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddStop(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Stop</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
