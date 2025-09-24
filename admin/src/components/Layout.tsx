import { Link, NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  TruckIcon,
  MapIcon,
  ClockIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  UsersIcon as UsersSolidIcon,
  TruckIcon as TruckSolidIcon,
  MapIcon as MapSolidIcon,
  ClockIcon as ClockSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
} from '@heroicons/react/24/solid';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconSolid: HomeSolidIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, iconSolid: ChartBarSolidIcon },
  { name: 'Users', href: '/users', icon: UsersIcon, iconSolid: UsersSolidIcon },
  { name: 'Drivers', href: '/drivers', icon: UserCircleIcon, iconSolid: UserCircleIcon },
  { name: 'Buses', href: '/buses', icon: TruckIcon, iconSolid: TruckSolidIcon },
  { name: 'Routes', href: '/routes', icon: MapIcon, iconSolid: MapSolidIcon },
  { name: 'Trips', href: '/trips', icon: ClockIcon, iconSolid: ClockSolidIcon },
  { name: 'Driver Assignments', href: '/driver-assignments', icon: UserCircleIcon, iconSolid: UserCircleIcon },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleSignOut = () => {
    signout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden"
          >
            <SidebarContent onClose={() => setSidebarOpen(false)} user={user} onSignOut={handleSignOut} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4 shadow-sm">
          <SidebarContent user={user} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Saarthi Admin'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-x-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onClose, user, onSignOut }: { 
  onClose?: () => void; 
  user: any; 
  onSignOut: () => void; 
}) {
  const location = useLocation();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saarthi</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </motion.div>
        {onClose && (
          <button
            type="button"
            className="lg:hidden -m-2 p-2 rounded-md text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = isActive ? item.iconSolid : item.icon;
            
            return (
              <motion.li 
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto h-2 w-2 rounded-full bg-blue-600"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>

        {/* User profile section */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center gap-x-3 p-3 text-sm font-medium text-gray-700">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
