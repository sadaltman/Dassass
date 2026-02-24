import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

function Clubs() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const response = await api.get('/organizers');
      setOrganizers(response.data.organizers || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load clubs');
      setLoading(false);
    }
  };

  const handleFollow = async (organizerId) => {
    if (!isAuthenticated) {
      alert('Please login to follow clubs');
      return;
    }
    
    try {
      await api.post(`/auth/follow/${organizerId}`);
      alert('Now following!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async (organizerId) => {
    try {
      await api.delete(`/auth/follow/${organizerId}`);
      alert('Unfollowed');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unfollow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Clubs & Organizers</h1>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
            {error}
          </div>
        )}

        {organizers.length === 0 ? (
          <div className="border-2 border-black p-6">
            <p>No clubs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizers.map(org => (
              <div key={org._id} className="border-2 border-black p-4">
                <Link to={`/clubs/${org._id}`}>
                  <h3 className="font-bold text-xl mb-2 hover:underline">{org.name}</h3>
                </Link>
                <p className="text-sm mb-2">
                  <span className="px-2 py-1 bg-gray-200 border border-black">{org.category}</span>
                </p>
                <p className="text-sm mb-4 line-clamp-2">{org.aboutText || 'No description available'}</p>
                <div className="text-sm mb-4 space-y-1">
                  {org.publicContactEmail && (
                    <p><strong>Email:</strong> {org.publicContactEmail}</p>
                  )}
                  {org.phoneNumber && (
                    <p><strong>Phone:</strong> {org.phoneNumber}</p>
                  )}
                  {!org.publicContactEmail && !org.phoneNumber && (
                    <p className="text-gray-500 italic">No contact info</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link
                    to={`/clubs/${org._id}`}
                    className="px-4 py-2 border-2 border-black hover:bg-gray-100"
                  >
                    View Events
                  </Link>
                  {isAuthenticated && (
                    user?.followedClubs?.includes(org._id) ? (
                      <button
                        onClick={() => handleUnfollow(org._id)}
                        className="px-4 py-2 border-2 border-black bg-gray-200 hover:bg-gray-300"
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(org._id)}
                        className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-gray-800"
                      >
                        Follow
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Clubs;
