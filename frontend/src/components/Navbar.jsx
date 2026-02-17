// Navbar Component - Shows navigation links at the top of every page
// This will be reused across all pages

import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Left side - Logo */}
        <Link to="/" className="text-xl font-bold hover:underline">
          Felicity Events
        </Link>
        
        {/* Right side - Navigation Links */}
        <div className="flex space-x-4 items-center">
          {/* Show different buttons based on login status */}
          {isAuthenticated ? (
            <>
              <Link to="/" className="px-4 py-2 hover:bg-gray-100">
                Dashboard
              </Link>
              <Link to="/events" className="px-4 py-2 hover:bg-gray-100">
                Browse Events
              </Link>
              <Link to="/clubs" className="px-4 py-2 hover:bg-gray-100">
                Clubs
              </Link>
              <Link to="/profile" className="px-4 py-2 hover:bg-gray-100">
                Profile
              </Link>
              <span className="px-4 py-2 font-bold">
                Hello, {user?.firstName}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-black hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="px-4 py-2 hover:bg-gray-100">
                Home
              </Link>
              <Link to="/events" className="px-4 py-2 hover:bg-gray-100">
                Events
              </Link>
              <Link to="/clubs" className="px-4 py-2 hover:bg-gray-100">
                Clubs
              </Link>
              <Link to="/login" className="px-4 py-2 border-2 border-black hover:bg-gray-100">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

// NEW CONCEPTS:
// - useContext(AuthContext) gives us access to global user state
// - Conditional rendering: {isAuthenticated ? <LoggedIn /> : <LoggedOut />}
// - user?.name uses optional chaining (safe way to access nested properties)
// - navigate('/') programmatically redirects to home page
