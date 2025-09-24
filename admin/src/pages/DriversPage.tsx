import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUsers, updateUser, type User } from '@/api/users';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { PageLoading } from '@/components/ui/Loading';
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  ClockIcon,
  StarIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

export default function DriversPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const drivers = useMemo(() => users.filter(u => u.role === 'driver'), [users]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter drivers based on search term and status
  useEffect(() => {
    let filtered = drivers;

    if (searchTerm) {
      filtered = filtered.filter(driver =>
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (driver.name && driver.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (driver.phone && driver.phone.includes(searchTerm))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(driver => 
        statusFilter === 'active' ? driver.is_active : !driver.is_active
      );
    }

    setFilteredDrivers(filtered);
  }, [drivers, searchTerm, statusFilter]);

  const toggleActive = async (driver: User) => {
    try {
      await updateUser(driver.id, { is_active: !driver.is_active });
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to update driver status');
    }
  };

  if (loading) return <PageLoading message="Loading drivers..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Drivers</h3>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCircleIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
            <p className="text-gray-600">Manage your fleet drivers and their status</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/driver-assignments')}
          className="flex items-center"
        >
          <MapIcon className="h-5 w-5 mr-2" />
          Manage Route Assignments
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold">{drivers.length}</p>
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
                <p className="text-2xl font-bold">{drivers.filter(d => d.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">On Duty</p>
                <p className="text-2xl font-bold">{Math.floor(drivers.filter(d => d.is_active).length * 0.7)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <StarIcon className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">4.6</p>
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
                placeholder="Search drivers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {driver.name ? driver.name[0].toUpperCase() : driver.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {driver.name || 'No Name'}
                      </h3>
                      <p className="text-sm text-gray-500">Driver ID: #{driver.id}</p>
                    </div>
                  </div>
                  <Badge variant={driver.is_active ? 'success' : 'destructive'}>
                    {driver.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span className="truncate">{driver.email}</span>
                  </div>
                  {driver.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{driver.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <TruckIcon className="h-4 w-4" />
                      <span>Status</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {driver.is_active ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-green-700">On Duty</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                          <span className="text-red-700">Off Duty</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <StarIcon className="h-4 w-4" />
                      <span>Rating</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold">4.{Math.floor(Math.random() * 9) + 1}</span>
                      <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => toggleActive(driver)}
                    variant={driver.is_active ? 'destructive' : 'success'}
                    size="sm"
                  >
                    {driver.is_active ? 'Set Inactive' : 'Set Active'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "No drivers match your current filters" 
                : "No drivers have been registered yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
