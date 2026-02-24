import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 border-2 border-black hover:bg-gray-100 flex items-center gap-1"
      >
        Login
        <span style={{ fontSize: '10px' }}>▼</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 border-2 border-black bg-white z-50">
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-200"
          >
            Participant
          </Link>
          <Link
            to="/organizer/login"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-200"
          >
            Organiser
          </Link>
          <Link
            to="/admin/login"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 hover:bg-gray-100"
          >
            Admin
          </Link>
        </div>
      )}
    </div>
  );
}

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
        <Link to="/" className="text-xl font-bold hover:underline">
          Felicity Events
        </Link>

        <div className="flex space-x-4 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/" className="px-4 py-2 hover:bg-gray-100">Dashboard</Link>
              <Link to="/events" className="px-4 py-2 hover:bg-gray-100">Browse Events</Link>
              <Link to="/clubs" className="px-4 py-2 hover:bg-gray-100">Clubs</Link>
              <Link to="/profile" className="px-4 py-2 hover:bg-gray-100">Profile</Link>
              <span className="px-4 py-2 font-bold">Hello, {user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-black hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="px-4 py-2 hover:bg-gray-100">Home</Link>
              <Link to="/events" className="px-4 py-2 hover:bg-gray-100">Events</Link>
              <Link to="/clubs" className="px-4 py-2 hover:bg-gray-100">Clubs</Link>
              <LoginDropdown />
              <Link
                to="/signup"
                className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
              >
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
