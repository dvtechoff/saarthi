import { useEffect, useState } from 'react';
import { listTrips, type Trip } from '@/api/trips';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { PageLoading } from '@/components/ui/Loading';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverId, setDriverId] = useState<string>('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await listTrips(driverId ? Number(driverId) : undefined);
      setTrips(data);
      setFilteredTrips(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter trips based on search term and status
  useEffect(() => {
    let filtered = trips;

    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.tripId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status.toLowerCase() === statusFilter);
    }

    setFilteredTrips(filtered);
  }, [trips, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'active': return 'blue';
      case 'in_progress': return 'blue';
      case 'cancelled': return 'destructive';
      case 'scheduled': return 'warning';
      default: return 'outline';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDistance = (distance: number) => {
    return distance ? `${distance.toFixed(1)} km` : 'N/A';
  };

  if (loading) return <PageLoading message="Loading trips..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Trips</h3>
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
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <ClockIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="text-gray-600">Monitor and manage all bus trips</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold">{trips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {trips.filter(t => t.status.toLowerCase() === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {trips.filter(t => ['active', 'in_progress'].includes(t.status.toLowerCase())).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Distance</p>
                <p className="text-2xl font-bold">
                  {trips.length > 0 
                    ? (trips.reduce((sum, trip) => sum + (trip.distance || 0), 0) / trips.length).toFixed(1)
                    : '0'} km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trips by ID, route, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Filter by Driver ID"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-40"
              />
              <Button onClick={load} variant="outline" size="sm">
                Apply Filter
              </Button>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trip History ({filteredTrips.length})</CardTitle>
          <CardDescription>Complete record of all bus trips</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip Details</TableHead>
                  <TableHead>Route & Driver</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Distance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((trip, index) => (
                  <motion.tr
                    key={trip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{trip.tripId}</div>
                        <div className="text-sm text-gray-500">ID: #{trip.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{trip.routeName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{trip.driverName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {formatTime(trip.startTime)}
                          </span>
                        </div>
                        {trip.endTime && (
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-gray-600">
                              {formatTime(trip.endTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(trip.status) as any}>
                        {trip.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <span className="font-medium">{formatDistance(trip.distance)}</span>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || driverId
                  ? "No trips match your current filters"
                  : "No trips found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
