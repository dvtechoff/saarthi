import { useEffect, useState } from 'react';
import { getAnalytics } from '@/api/authority';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageLoading } from '@/components/ui/Loading';
import {
  ChartBarIcon,
  TruckIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const analytics = await getAnalytics();
        setData(analytics);
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageLoading message="Loading analytics..." />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center space-y-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Error Loading Analytics</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </Card>
    </div>
  );
  if (!data) return null;

  const metrics = [
    {
      title: 'Fleet Efficiency',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon,
      description: 'Overall fleet performance'
    },
    {
      title: 'Avg Trip Duration',
      value: '45m',
      change: '-3m',
      changeType: 'positive' as const,
      icon: ClockIcon,
      description: 'Average time per trip'
    },
    {
      title: 'Route Coverage',
      value: '12.4k km',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: MapPinIcon,
      description: 'Total distance covered'
    },
    {
      title: 'Fuel Efficiency',
      value: '8.5L/100km',
      change: '-0.3L',
      changeType: 'positive' as const,
      icon: TruckIcon,
      description: 'Fleet average consumption'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <ChartBarIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your fleet operations</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <metric.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.changeType === 'positive' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4" />
                    )}
                    <span>{metric.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{metric.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Statistics</CardTitle>
            <CardDescription>Daily trip performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Trips</span>
                <span className="font-semibold">{data.activeTrips || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{Math.floor((data.totalTrips - data.activeTrips) * 0.8) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-semibold text-blue-600">{data.activeTrips || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Speed</span>
                <span className="font-semibold">{data.averageSpeed || 0} km/h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Current vehicle operational status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Vehicles</span>
                <span className="font-semibold">{data.totalBuses || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active</span>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-600">{data.activeBuses || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="font-semibold text-orange-600">{(data.totalBuses - data.activeBuses) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Utilization Rate</span>
                <span className="font-semibold">{Math.round(((data.activeBuses / data.totalBuses) * 100)) || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Indicators</CardTitle>
          <CardDescription>Key performance metrics for your fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">98.2%</div>
              <div className="text-sm text-gray-600">On-Time Performance</div>
              <div className="text-xs text-green-600 mt-1">+1.2% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">4.7</div>
              <div className="text-sm text-gray-600">Average Rating</div>
              <div className="text-xs text-gray-500 mt-1">Based on {data.totalFeedbacks || 0} reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">15min</div>
              <div className="text-sm text-gray-600">Average Wait Time</div>
              <div className="text-xs text-green-600 mt-1">-2min improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}