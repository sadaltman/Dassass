// Organizer Dashboard - Main hub for event management
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organizerName, setOrganizerName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('organizerToken');
    if (!token) {
      navigate('/organizer/login');
      return;
    }

    // Fetch organizer profile
    axios.get('https://dassass.onrender.com/api/organizers/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setOrganizerName(res.data.organizer.name);
    })
    .catch(err => {
      console.error('Failed to fetch profile:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('organizerToken');
        navigate('/organizer/login');
      }
    });

    // Fetch organizer's events only
    axios.get('https://dassass.onrender.com/api/events/my-events', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setEvents(res.data.events);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('organizerToken');
        navigate('/organizer/login');
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('organizerToken');
    localStorage.removeItem('userType');
    navigate('/organizer/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Organizer Navbar */}
      <nav className="bg-black text-white p-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Organizer Panel</h1>
            {organizerName && <p className="text-sm text-gray-300 mt-1">{organizerName}</p>}
          </div>
          <div className="flex gap-2">
            <Link
              to="/organizer/profile"
              className="px-4 py-2 border-2 border-white hover:bg-gray-800"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Link to="/organizer/create-event" className="border-2 border-black p-4 hover:bg-gray-100 text-center">
            <p className="font-bold">Create Event</p>
          </Link>
          <Link to="/organizer/my-events" className="border-2 border-black p-4 hover:bg-gray-100 text-center">
            <p className="font-bold">My Events</p>
          </Link>
          <Link to="/organizer/qr-scanner" className="border-2 border-black p-4 hover:bg-gray-100 text-center">
            <p className="font-bold">QR Scanner</p>
          </Link>
          <Link to="/organizer/payments" className="border-2 border-black p-4 hover:bg-gray-100 text-center">
            <p className="font-bold">Payments</p>
          </Link>
        </div>

        {/* Recent Events */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-4">Recent Events</h2>
          
          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <div>
              <p className="mb-4">You haven't created any events yet.</p>
              <Link to="/organizer/create-event" className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800">
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 5).map(event => (
                <div key={event._id} className="flex justify-between items-center border-2 border-black p-3">
                  <div>
                    <p className="font-bold">{event.name}</p>
                    <p className="text-sm">Status: {event.status}</p>
                  </div>
                  <Link to={`/organizer/events/${event._id}`} className="px-3 py-1 border-2 border-black hover:bg-gray-100">
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
