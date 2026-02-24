import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';

function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      const response = await axios.get(
        `${API_URL}/events/my-events`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load your events');
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.put(
        `${API_URL}/events/${id}`,
        { status: 'published' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Event published successfully!');
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.delete(
        `${API_URL}/events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Event deleted successfully');
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black text-white p-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Organizer Panel</h1>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Events</h1>
          <Link 
            to="/organizer/create-event"
            className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
          >
            Create New Event
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading your events...</p>
        ) : events.length === 0 ? (
          <div className="border-2 border-black p-6">
            <p className="mb-4">You haven't created any events yet.</p>
            <Link 
              to="/organizer/create-event"
              className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 inline-block"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => (
              <div key={event._id} className="border-2 border-black p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl">{event.name}</h3>
                  <span className={`px-2 py-1 text-xs border-2 ${
                    event.status === 'published' 
                      ? 'border-green-500 bg-green-100' 
                      : 'border-yellow-500 bg-yellow-100'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm mb-2 line-clamp-2">{event.description}</p>
                
                <div className="text-sm space-y-1 mb-3">
                  <p><strong>Type:</strong> {event.eventType}</p>
                  <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                  <p><strong>Fee:</strong> ₹{event.regFee || 0}</p>
                  <p>
                    <strong>Registrations:</strong> {event.currentRegistrations || 0} / {event.regLimit || '∞'}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/organizer/events/${event._id}`}
                    className="px-3 py-1 border-2 border-black hover:bg-gray-100 text-sm"
                  >
                    Manage
                  </Link>
                  
                  {event.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(event._id)}
                      className="px-3 py-1 bg-green-600 text-white border-2 border-green-700 hover:bg-green-700 text-sm"
                    >
                      Publish
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="px-3 py-1 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 text-sm ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="px-4 py-2 border-2 border-black hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyEvents;
