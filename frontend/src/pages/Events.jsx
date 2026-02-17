// Events List Page - Browse all events with search and filters
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function Events() {
  const { isAuthenticated } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [followedOnly, setFollowedOnly] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchTrending();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('status', 'published');
      if (search) params.append('search', search);
      if (eventType) params.append('eventType', eventType);
      if (eligibility) params.append('eligibility', eligibility);
      if (followedOnly && isAuthenticated) params.append('followedOnly', 'true');
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.get(
        `http://localhost:5000/api/events?${params.toString()}`,
        config
      );
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load events');
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events/trending');
      setTrendingEvents(response.data.events || []);
    } catch (err) {
      console.error('Failed to fetch trending');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchEvents();
  };

  const handleFilterChange = () => {
    setLoading(true);
    fetchEvents();
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        fetchEvents();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [eventType, eligibility, followedOnly, startDate, endDate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Events</h1>

        {/* Trending Section */}
        {trendingEvents.length > 0 && (
          <div className="border-2 border-black p-4 mb-6">
            <h2 className="font-bold mb-2"> Trending (Top 5 in 24h)</h2>
            <div className="flex gap-2 flex-wrap">
              {trendingEvents.map(event => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="px-3 py-1 border-2 border-black hover:bg-gray-100"
                >
                  {event.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="border-2 border-black p-4 mb-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events or organizers..."
                className="flex-1 border-2 border-black p-2"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-bold mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="border-2 border-black p-2"
              >
                <option value="">All Types</option>
                <option value="normal">Normal</option>
                <option value="merchandise">Merchandise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Eligibility</label>
              <select
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                className="border-2 border-black p-2"
              >
                <option value="">All</option>
                <option value="all">Open to All</option>
                <option value="iiit-only">IIIT Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-2 border-black p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-2 border-black p-2"
              />
            </div>

            {isAuthenticated && (
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followedOnly}
                    onChange={(e) => setFollowedOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-bold">Followed Clubs Only</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <div className="border-2 border-black p-6">
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <Link 
                key={event._id} 
                to={`/events/${event._id}`}
                className="border-2 border-black p-4 hover:bg-gray-100"
              >
                <h3 className="font-bold text-lg mb-2">{event.name}</h3>
                <p className="text-sm mb-2 line-clamp-2">{event.description}</p>
                <p className="text-sm"><strong>Type:</strong> {event.eventType}</p>
                <p className="text-sm"><strong>Fee:</strong> ₹{event.regFee || 0}</p>
                <p className="text-sm"><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Deadline:</strong> {new Date(event.regDeadline).toLocaleDateString()}</p>
                {event.organizerId && (
                  <p className="text-sm"><strong>By:</strong> {event.organizerId.name}</p>
                )}
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs border ${
                    event.eligibility === 'iiit-only' ? 'border-blue-500 bg-blue-100' : 'border-green-500 bg-green-100'
                  }`}>
                    {event.eligibility === 'iiit-only' ? 'IIIT Only' : 'Open to All'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
