// Main App Component - Controls routing (which page to show)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Participant Pages
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

// Organizer Pages
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerProfile from './pages/OrganizerProfile';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import ManageEvent from './pages/ManageEvent';
import EditEvent from './pages/EditEvent';
import QRScanner from './pages/QRScanner';
import PaymentApprovals from './pages/PaymentApprovals';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Participant Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          
          {/* Organizer Routes */}
          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/profile" element={<OrganizerProfile />} />
          <Route path="/organizer/create-event" element={<CreateEvent />} />
          <Route path="/organizer/my-events" element={<MyEvents />} />
          <Route path="/organizer/events/:id" element={<ManageEvent />} />
          <Route path="/organizer/events/:id/edit" element={<EditEvent />} />
          <Route path="/organizer/qr-scanner" element={<QRScanner />} />
          <Route path="/organizer/payments" element={<PaymentApprovals />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

// HOW ROUTER WORKS:
// - BrowserRouter enables routing in your app
// - Routes is a container for all your routes
// - Route maps a URL path to a component
// - When user visits /login, React shows <Login /> component
// - No page reload happens - React just swaps components!
