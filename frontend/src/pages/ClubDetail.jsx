import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../utils/api';

function ClubDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizerDetails();
  }, [id]);

  const fetchOrganizerDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/organizers/${id}`);
      setOrganizer(response.data.organizer);
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load club details');
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert('Please login to follow clubs');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_URL}/auth/follow/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Now following!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `${API_URL}/auth/follow/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Unfollowed');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unfollow');
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'published' || e.status === 'ongoing');
  const pastEvents = events.filter(e => e.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600">{error || 'Club not found'}</p>
          <Link to="/clubs" className="underline">Back to Clubs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Club Info */}
        <div className="border-2 border-black p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{organizer.name}</h1>
              <p className="mb-2">
                <span className="px-2 py-1 bg-gray-200 border border-black">{organizer.category}</span>
              </p>
            </div>
            {isAuthenticated && (
              user?.followedClubs?.includes(id) ? (
                <button
                  onClick={handleUnfollow}
                  className="px-4 py-2 border-2 border-black bg-gray-200 hover:bg-gray-300"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-gray-800"
                >
                  Follow
                </button>
              )
            )}
          </div>
          
          <p className="mt-4 mb-4">{organizer.aboutText || 'No description available'}</p>
          
          <div className="mt-4 space-y-1">
            {organizer.publicContactEmail ? (
              <p><strong>Email:</strong> {organizer.publicContactEmail}</p>
            ) : null}
            {organizer.phoneNumber ? (
              <p><strong>Phone:</strong> {organizer.phoneNumber}</p>
            ) : null}
            {!organizer.publicContactEmail && !organizer.phoneNumber && (
              <p className="text-gray-500 italic">No contact information available</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="border-2 border-black p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          
          {upcomingEvents.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block border-2 border-black p-4 hover:bg-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{event.name}</h3>
                      <p className="text-sm">
                        <strong>Type:</strong> {event.eventType} | <strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs border-2 ${
                      event.status === 'published' ? 'border-green-500 bg-green-100' : 'border-blue-500 bg-blue-100'
                    }`}>
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        <div className="border-2 border-black p-6">
          <h2 className="text-2xl font-bold mb-4">Past Events</h2>
          
          {pastEvents.length === 0 ? (
            <p>No past events.</p>
          ) : (
            <div className="space-y-4">
              {pastEvents.map(event => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block border-2 border-black p-4 hover:bg-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{event.name}</h3>
                      <p className="text-sm">
                        <strong>Type:</strong> {event.eventType} | <strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs border-2 border-gray-500 bg-gray-100">
                      COMPLETED
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link to="/clubs" className="px-4 py-2 border-2 border-black hover:bg-gray-100">
            Back to Clubs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ClubDetail;
