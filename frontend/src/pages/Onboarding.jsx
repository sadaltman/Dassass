// Onboarding Page - New users select interests and follow clubs
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const INTEREST_OPTIONS = [
  'Music', 'Dance', 'Drama', 'Art', 'Photography',
  'Coding', 'Robotics', 'AI/ML', 'Web Development', 'Cybersecurity',
  'Cricket', 'Football', 'Basketball', 'Badminton', 'Chess',
  'Debate', 'Poetry', 'Writing', 'Quiz', 'Public Speaking'
];

function Onboarding() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [followedClubs, setFollowedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchClubs();
  }, [isAuthenticated]);

  const fetchClubs = async () => {
    try {
      const response = await axios.get('https://dassass.onrender.com/api/organizers/all');
      setClubs(response.data.organizers || []);
    } catch (err) {
      console.error('Failed to load clubs');
    }
    setLoading(false);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleClub = (clubId) => {
    setFollowedClubs(prev =>
      prev.includes(clubId)
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'https://dassass.onrender.com/api/auth/onboarding',
        { interests: selectedInterests, followedClubs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName || 'there'}!</h1>
          <p className="text-gray-600">Let's personalize your experience. Step {step} of 2</p>
          <div className="flex gap-2 mt-3">
            <div className={`h-2 flex-1 ${step >= 1 ? 'bg-black' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">What are you interested in?</h2>
            <p className="text-gray-600 mb-6">Select topics that interest you to get personalized event recommendations.</p>

            <div className="flex flex-wrap gap-3 mb-8">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 border-2 border-black text-sm font-medium transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-gray-600 hover:text-black"
              >
                Skip
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">Follow Clubs & Organizations</h2>
            <p className="text-gray-600 mb-6">Follow clubs to stay updated on their events.</p>

            {clubs.length === 0 ? (
              <p className="text-gray-500 mb-6">No clubs available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {clubs.map(club => (
                  <button
                    key={club._id}
                    onClick={() => toggleClub(club._id)}
                    className={`p-4 border-2 text-left transition-colors ${
                      followedClubs.includes(club._id)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{club.name}</h3>
                        {club.category && (
                          <span className="text-xs px-2 py-0.5 border border-black bg-gray-100">
                            {club.category}
                          </span>
                        )}
                      </div>
                      {followedClubs.includes(club._id) && (
                        <span className="text-lg">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border-2 border-black hover:bg-gray-100"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 text-gray-600 hover:text-black"
                >
                  Skip
                </button>
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="px-6 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Get Started'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;
