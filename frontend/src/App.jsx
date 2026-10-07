import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import UserDashboard from './pages/user/UserDashboard';
import ServiceSelection from './pages/user/ServiceSelection';
import MyToken from './pages/user/MyToken';
import QueueStatusPage from './pages/user/QueueStatusPage';
import AppointmentHistory from './pages/user/AppointmentHistory';
import NotificationsPage from './pages/user/NotificationsPage';
import AiAssistantPage from './pages/user/AiAssistantPage';
import ProfilePage from './pages/user/ProfilePage';
import StaffDashboard from './pages/staff/StaffDashboard';
import ActiveQueue from './pages/staff/ActiveQueue';
import QueueStatistics from './pages/staff/QueueStatistics';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import QueueMonitoring from './pages/admin/QueueMonitoring';
import Statistics from './pages/admin/Statistics';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />; // Or unauthorized page
  }
  return children;
};

const AppLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 py-8">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
            <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
            <Route path="/register" element={<AppLayout><RegisterPage /></AppLayout>} />

            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['USER']}><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute allowedRoles={['USER']}><AppLayout><ServiceSelection /></AppLayout></ProtectedRoute>} />
            <Route path="/my-token" element={<ProtectedRoute allowedRoles={['USER']}><AppLayout><MyToken /></AppLayout></ProtectedRoute>} />
            <Route path="/queue/:serviceId" element={<ProtectedRoute allowedRoles={['USER']}><AppLayout><QueueStatusPage /></AppLayout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute allowedRoles={['USER']}><AppLayout><AppointmentHistory /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={['USER']}><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute allowedRoles={['USER']}><AppLayout><AiAssistantPage /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF']}><AppLayout><StaffDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/staff/queue" element={<ProtectedRoute allowedRoles={['STAFF']}><AppLayout><ActiveQueue /></AppLayout></ProtectedRoute>} />
            <Route path="/staff/stats" element={<ProtectedRoute allowedRoles={['STAFF']}><AppLayout><QueueStatistics /></AppLayout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><ServiceManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/queues" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><QueueMonitoring /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><Statistics /></AppLayout></ProtectedRoute>} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
