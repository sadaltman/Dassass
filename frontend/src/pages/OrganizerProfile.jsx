// Organizer Profile Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrganizerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    aboutText: '',
    publicContactEmail: '',
    phoneNumber: '',
    webhookUrl: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('organizerToken');
    if (!token) {
      navigate('/organizer/login');
      return;
    }

    try {
      const response = await axios.get('https://dassass.onrender.com/api/organizers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const org = response.data.organizer;
      setFormData({
        name: org.name || '',
        category: org.category || '',
        aboutText: org.aboutText || '',
        publicContactEmail: org.publicContactEmail || '',
        phoneNumber: org.phoneNumber || '',
        webhookUrl: org.webhookUrl || ''
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('organizerToken');

    try {
      await axios.put(
        'https://dassass.onrender.com/api/organizers/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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

    const token = localStorage.getItem('organizerToken');

    try {
      await axios.put(
        'https://dassass.onrender.com/api/organizers/change-password',
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

  const handleRequestPasswordReset = async () => {
    if (!window.confirm('Request a password reset? An admin will need to approve this.')) return;

    const token = localStorage.getItem('organizerToken');

    try {
      await axios.post(
        'https://dassass.onrender.com/api/organizers/request-password-reset',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Password reset request submitted. An admin will review it.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit reset request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('organizerToken');
    navigate('/organizer/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-black text-white p-4 border-b-4 border-black">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-bold">Organizer Panel</h1>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black text-white p-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Organizer Panel</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/organizer/dashboard')}
              className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-gray-200"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border-2 border-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Organizer Profile</h1>

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
          <h2 className="text-xl font-bold mb-4">Organization Information</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-bold mb-2">Organization Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-black p-2"
              >
                <option value="">Select Category</option>
                <option value="Cultural">Cultural</option>
                <option value="Technical">Technical</option>
                <option value="Sports">Sports</option>
                <option value="Literary">Literary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Description</label>
              <textarea
                name="aboutText"
                value={formData.aboutText}
                onChange={handleChange}
                rows="4"
                className="w-full border-2 border-black p-2"
                placeholder="Tell participants about your club..."
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Public Contact Email</label>
              <input
                type="email"
                name="publicContactEmail"
                value={formData.publicContactEmail}
                onChange={handleChange}
                className="w-full border-2 border-black p-2"
                placeholder="contact@yourclub.com"
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border-2 border-black p-2"
              />
            </div>

            <div className="mb-6">
              <label className="block font-bold mb-2">Discord Webhook URL</label>
              <input
                type="url"
                name="webhookUrl"
                value={formData.webhookUrl}
                onChange={handleChange}
                className="w-full border-2 border-black p-2"
                placeholder="https://discord.com/api/webhooks/..."
              />
              <p className="text-sm text-gray-600 mt-1">
                New events will be automatically posted to this Discord channel
              </p>
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
        <div className="border-2 border-black p-6">
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

          <div className="mt-6 pt-6 border-t border-gray-300">
            <h3 className="font-bold mb-2">Forgot Current Password?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Request a password reset. An admin will review and approve your request.
            </p>
            <button
              onClick={handleRequestPasswordReset}
              type="button"
              className="px-4 py-2 border-2 border-black hover:bg-gray-100"
            >
              Request Password Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerProfile;
