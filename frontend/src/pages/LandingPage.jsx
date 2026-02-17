// Landing Page - Shows different content based on auth status
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Home from './Home';
import Dashboard from './Dashboard';

function LandingPage() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show Dashboard if logged in, Home if not
  return isAuthenticated ? <Dashboard /> : <Home />;
}

export default LandingPage;
