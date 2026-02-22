import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerProfile from './pages/OrganizerProfile';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import ManageEvent from './pages/ManageEvent';
import EditEvent from './pages/EditEvent';
import QRScanner from './pages/QRScanner';
import PaymentApprovals from './pages/PaymentApprovals';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function OrganizerRoute({ children }) {
  const token = localStorage.getItem('organizerToken');
  return token ? children : <Navigate to="/organizer/login" />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
          <Route path="/clubs/:id" element={<ProtectedRoute><ClubDetail /></ProtectedRoute>} />

          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-registrations" element={<ProtectedRoute><MyRegistrations /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route path="/organizer/dashboard" element={<OrganizerRoute><OrganizerDashboard /></OrganizerRoute>} />
          <Route path="/organizer/profile" element={<OrganizerRoute><OrganizerProfile /></OrganizerRoute>} />
          <Route path="/organizer/create-event" element={<OrganizerRoute><CreateEvent /></OrganizerRoute>} />
          <Route path="/organizer/my-events" element={<OrganizerRoute><MyEvents /></OrganizerRoute>} />
          <Route path="/organizer/events/:id" element={<OrganizerRoute><ManageEvent /></OrganizerRoute>} />
          <Route path="/organizer/events/:id/edit" element={<OrganizerRoute><EditEvent /></OrganizerRoute>} />
          <Route path="/organizer/qr-scanner" element={<OrganizerRoute><QRScanner /></OrganizerRoute>} />
          <Route path="/organizer/payments" element={<OrganizerRoute><PaymentApprovals /></OrganizerRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
