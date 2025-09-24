import { useEffect, useState } from 'react';
import { getAnalytics } from '@/api/authority';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import { PageLoading } from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  TruckIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
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

  if (loading) return <PageLoading message="Loading dashboard analytics..." />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center space-y-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Card>
    </div>
  );
  if (!data) return null;

  const statsCards = [
    {
      title: "Total Trips",
      value: data.totalTrips?.toLocaleString() || '0',
      icon: ClockIcon,
      change: "+12%",
      changeType: "positive" as const,
      description: "vs last month"
    },
    {
      title: "Active Trips",
      value: data.activeTrips?.toLocaleString() || '0',
      icon: CheckCircleIcon,
      change: "+5%",
      changeType: "positive" as const,
      description: "currently running"
    },
    {
      title: "Total Buses",
      value: data.totalBuses?.toLocaleString() || '0',
      icon: TruckIcon,
      change: "+2%",
      changeType: "positive" as const,
      description: "in fleet"
    },
    {
      title: "Active Buses",
      value: data.activeBuses?.toLocaleString() || '0',
      icon: BoltIcon,
      change: "0%",
      changeType: "neutral" as const,
      description: "currently operational"
    },
    {
      title: "User Feedbacks",
      value: data.totalFeedbacks?.toLocaleString() || '0',
      icon: ChatBubbleLeftRightIcon,
      change: "+8%",
      changeType: "positive" as const,
      description: "this month"
    },
    {
      title: "Average Speed",
      value: `${data.averageSpeed || 0} km/h`,
      icon: MapPinIcon,
      change: "+3%",
      changeType: "positive" as const,
      description: "fleet average"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
          <p className="text-blue-100 text-lg">
            Here's what's happening with your fleet today.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </motion.div>

      {/* Statistics Grid */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fleet Overview</h2>
          <p className="text-gray-600">Real-time insights into your transportation network</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={stat.icon}
                description={stat.description}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BoltIcon className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Add New Bus', href: '/buses', color: 'bg-blue-500 hover:bg-blue-600' },
                { label: 'Create Route', href: '/routes', color: 'bg-green-500 hover:bg-green-600' },
                { label: 'View Users', href: '/users', color: 'bg-purple-500 hover:bg-purple-600' },
                { label: 'Active Trips', href: '/trips', color: 'bg-orange-500 hover:bg-orange-600' },
              ].map((action, index) => (
                <motion.a
                  key={action.label}
                  href={action.href}
                  className={`${action.color} text-white p-4 rounded-xl text-center font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 block`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {action.label}
                </motion.a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Real-time Updates</span>
                <span className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New bus added to Route #12</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Route optimization completed</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Driver submitted feedback</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
