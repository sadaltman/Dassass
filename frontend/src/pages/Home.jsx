import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="border-2 border-black p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Felicity</h1>
          <p className="text-lg mb-6">Discover and register for campus events</p>
          <Link to="/events" className="inline-block px-6 py-3 bg-black text-white border-2 border-black hover:bg-gray-800">
            Browse Events
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}

export default Home;
