// This is the Home Page component
import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // If logged in, redirect to dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    // White background
    <div className="min-h-screen bg-white">
      
      {/* Use the Navbar component instead of inline nav */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Main Box */}
        <div className="border-2 border-black p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Felicity
          </h1>
          
          <p className="text-lg mb-6">
            Discover and register for campus events
          </p>

          <Link to="/events" className="inline-block px-6 py-3 bg-black text-white border-2 border-black hover:bg-gray-800">
            Browse Events
          </Link>
        </div>

        {/* Quick Access Links */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link to="/events" className="border-2 border-black p-4 hover:bg-gray-100">
            <h3 className="font-bold mb-2">Events</h3>
            <p className="text-sm">Browse all upcoming events</p>
          </Link>
          
          <Link to="/signup" className="border-2 border-black p-4 hover:bg-gray-100">
            <h3 className="font-bold mb-2">Register</h3>
            <p className="text-sm">Sign up for events easily</p>
          </Link>
          
          <Link to="/clubs" className="border-2 border-black p-4 hover:bg-gray-100">
            <h3 className="font-bold mb-2">Clubs</h3>
            <p className="text-sm">Explore organizers</p>
          </Link>
        </div>

        {/* Organizer & Admin Access */}
        <div className="border-t-2 border-black pt-6">
          <h2 className="text-xl font-bold mb-4">Access Portal</h2>
          <div className="flex gap-4">
            <Link 
              to="/organizer/login" 
              className="px-6 py-3 border-2 border-black hover:bg-gray-100"
            >
              Organizer Login
            </Link>
            <Link 
              to="/admin/login" 
              className="px-6 py-3 border-2 border-black hover:bg-gray-100"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
