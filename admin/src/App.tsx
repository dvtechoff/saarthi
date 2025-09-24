import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import UsersPage from '@/pages/UsersPage';
import DriversPage from '@/pages/DriversPage';
import BusesPage from '@/pages/BusesPage';
import RoutesPage from '@/pages/RoutesPage';
import TripsPage from '@/pages/TripsPage';
import DriverRouteAssignmentPage from '@/pages/DriverRouteAssignmentPage';
import Layout from '@/components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}> 
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="buses" element={<BusesPage />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="driver-assignments" element={<DriverRouteAssignmentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
