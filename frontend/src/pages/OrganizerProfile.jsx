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
  
  const [loginEmail, setLoginEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    aboutText: '',
    publicContactEmail: '',
    phoneNumber: '',
    webhookUrl: ''
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
      setLoginEmail(org.loginEmail || '');
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
          
          {loginEmail && (
            <div className="mb-4">
              <label className="block font-bold mb-2">Login Email (non-editable)</label>
              <input
                type="email"
                value={loginEmail}
                disabled
                className="w-full border-2 border-gray-300 bg-gray-100 p-2 text-gray-600 cursor-not-allowed"
              />
            </div>
          )}
          
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

        {/* Password Reset */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-4">Password Management</h2>
          <p className="text-sm text-gray-600 mb-4">
            Password changes are managed by the admin. Submit a request below and an admin will review it.
          </p>
          <button
            onClick={handleRequestPasswordReset}
            type="button"
            className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
          >
            Request Password Reset from Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganizerProfile;
