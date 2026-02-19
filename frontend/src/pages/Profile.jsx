// Profile Page - View and edit participant profile
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../utils/api';

function Profile() {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [organizers, setOrganizers] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    collegeName: '',
    interests: []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const interestOptions = ['Technical', 'Cultural', 'Sports', 'Literary', 'Gaming', 'Music', 'Art', 'Dance'];

  useEffect(() => {
    fetchProfile();
    fetchOrganizers();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      login(token, userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        contactNumber: userData.contactNumber || '',
        collegeName: userData.collegeName || '',
        interests: userData.interests || []
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const response = await axios.get(`${API_URL}/organizers`);
      setOrganizers(response.data.organizers || []);
    } catch (err) {
      console.error('Failed to fetch organizers');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInterestToggle = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');

    try {
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      login(token, response.data.user);
      setSuccess('Profile updated successfully!');
      setSaving(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaving(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setSaving(false);
    }
  };

  const handleFollow = async (organizerId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_URL}/auth/follow/${organizerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async (organizerId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `${API_URL}/auth/follow/${organizerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unfollow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-2 border-green-500 text-green-700 p-3 mb-4">
            {success}
          </div>
        )}

        {/* Profile Info */}
        <div className="border-2 border-black p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-bold mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Email (cannot be changed)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border-2 border-gray-300 p-2 bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Participant Type (cannot be changed)</label>
              <input
                type="text"
                value={user?.participantType === 'iiit' ? 'IIIT Student' : 'Non-IIIT'}
                disabled
                className="w-full border-2 border-gray-300 p-2 bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">College / Organization</label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="mb-6">
              <label className="block font-bold mb-2">Areas of Interest</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1 border-2 border-black ${
                      formData.interests.includes(interest)
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="border-2 border-black p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label className="block font-bold mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="mb-6">
              <label className="block font-bold mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full border-2 border-black p-2"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
            >
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Followed Clubs */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-4">Followed Clubs</h2>
          
          {organizers.length === 0 ? (
            <p>No clubs available to follow.</p>
          ) : (
            <div className="space-y-2">
              {organizers.map(org => (
                <div key={org._id} className="flex justify-between items-center border-2 border-black p-3">
                  <div>
                    <p className="font-bold">{org.name}</p>
                    <p className="text-sm text-gray-600">{org.category}</p>
                  </div>
                  {user?.followedClubs?.includes(org._id) ? (
                    <button
                      onClick={() => handleUnfollow(org._id)}
                      className="px-4 py-1 border-2 border-black bg-gray-200 hover:bg-gray-300"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(org._id)}
                      className="px-4 py-1 border-2 border-black bg-black text-white hover:bg-gray-800"
                    >
                      Follow
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
