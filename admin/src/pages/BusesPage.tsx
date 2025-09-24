import { useEffect, useState } from 'react';
import { Bus, createBus, listBuses, updateBus } from '@/api/buses';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { PageLoading } from '@/components/ui/Loading';
import {
  TruckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<{ bus_number: string; route_id: number | null }>({
    bus_number: '',
    route_id: null,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listBuses();
      setBuses(data);
      setFilteredBuses(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter buses
  useEffect(() => {
    let filtered = buses;

    if (searchTerm) {
      filtered = filtered.filter(bus =>
        bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bus.route_id && bus.route_id.toString().includes(searchTerm))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bus =>
        statusFilter === 'active' ? bus.is_active : !bus.is_active
      );
    }

    setFilteredBuses(filtered);
  }, [buses, searchTerm, statusFilter]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createBus(form);
      setForm({ bus_number: '', route_id: null });
      setShowCreateForm(false);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to create bus');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (bus: Bus) => {
    try {
      await updateBus(bus.id, { is_active: !bus.is_active });
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to update bus');
    }
  };

  if (loading) return <PageLoading message="Loading buses..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Buses</h3>
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
          <div className="p-2 bg-blue-100 rounded-lg">
            <TruckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
            <p className="text-gray-600">Manage your bus fleet and vehicle status</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => setShowCreateForm(true)} className="mt-4 sm:mt-0">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Bus
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Buses</p>
                <p className="text-2xl font-bold">{buses.length}</p>
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
                <p className="text-2xl font-bold">{buses.filter(b => b.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">On Route</p>
                <p className="text-2xl font-bold">{buses.filter(b => b.route_id).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <WrenchScrewdriverIcon className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold">{buses.filter(b => !b.is_active).length}</p>
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
                placeholder="Search by bus number or route..."
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

      {/* Buses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuses.map((bus, index) => (
          <motion.div
            key={bus.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        Bus {bus.bus_number}
                      </h3>
                      <p className="text-sm text-gray-500">Vehicle ID: #{bus.id}</p>
                    </div>
                  </div>
                  <Badge variant={bus.is_active ? 'success' : 'destructive'}>
                    {bus.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Route Assignment</span>
                    {bus.route_id ? (
                      <Badge variant="blue">Route #{bus.route_id}</Badge>
                    ) : (
                      <Badge variant="outline">No Route</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center space-x-1">
                      {bus.is_active ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${bus.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {bus.is_active ? 'Operational' : 'Out of Service'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => toggleActive(bus)}
                    variant={bus.is_active ? 'destructive' : 'success'}
                    size="sm"
                  >
                    {bus.is_active ? 'Take Offline' : 'Bring Online'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredBuses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No buses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "No buses match your current filters" 
                : "Get started by adding your first bus to the fleet"}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add First Bus
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Bus Modal */}
      {showCreateForm && (
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
                <CardTitle>Add New Bus</CardTitle>
                <CardDescription>Register a new vehicle to your fleet</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bus Number
                    </label>
                    <Input
                      required
                      value={form.bus_number}
                      onChange={(e) => setForm(f => ({ ...f, bus_number: e.target.value }))}
                      placeholder="e.g. KL-01-AB-1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Route ID (Optional)
                    </label>
                    <Input
                      type="number"
                      value={form.route_id ?? ''}
                      onChange={(e) =>
                        setForm(f => ({
                          ...f,
                          route_id: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      placeholder="Assign to route (optional)"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Adding...' : 'Add Bus'}
                    </Button>
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
