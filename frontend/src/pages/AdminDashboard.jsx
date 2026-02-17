// Admin Dashboard - Manage Organizers
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [passwordResets, setPasswordResets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('organizers');
  const [newOrganizer, setNewOrganizer] = useState({
    name: '',
    loginEmail: '',
    password: '',
    category: ''
  });

  useEffect(() => {
    fetchOrganizers();
    fetchPasswordResets();
  }, []);

  const fetchOrganizers = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await axios.get(
        'http://localhost:5000/api/admin/organizers',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrganizers(response.data.organizers || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load organizers');
      setLoading(false);
    }
  };

  const fetchPasswordResets = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await axios.get(
        'http://localhost:5000/api/admin/password-resets',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordResets(response.data.requests || []);
    } catch (err) {
      console.error('Failed to load password resets:', err);
    }
  };

  const handleApproveReset = async (id) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/password-resets/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Password reset approved! New password: ${response.data.newPassword}`);
      fetchPasswordResets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve reset');
    }
  };

  const handleRejectReset = async (id) => {
    const comment = prompt('Enter rejection reason (optional):');
    const token = localStorage.getItem('adminToken');
    
    try {
      await axios.put(
        `http://localhost:5000/api/admin/password-resets/${id}/reject`,
        { comment: comment || 'Request rejected by admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Password reset rejected');
      fetchPasswordResets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject reset');
    }
  };

  const handleAddOrganizer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      await axios.post(
        'http://localhost:5000/api/admin/organizers',
        newOrganizer,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Organizer added successfully!');
      setNewOrganizer({ name: '', loginEmail: '', password: '', category: '' });
      setShowAddForm(false);
      fetchOrganizers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add organizer');
    }
  };

  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      await axios.put(
        `http://localhost:5000/api/admin/organizers/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchOrganizers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle organizer status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organizer?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/organizers/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Organizer deleted');
      fetchOrganizers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete organizer');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Navbar */}
      <nav className="bg-black text-white p-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-black">
          <button
            onClick={() => setActiveTab('organizers')}
            className={`px-4 py-2 -mb-0.5 ${activeTab === 'organizers' ? 'border-b-4 border-black font-bold' : 'text-gray-600'}`}
          >
            Organizers
          </button>
          <button
            onClick={() => setActiveTab('password-resets')}
            className={`px-4 py-2 -mb-0.5 ${activeTab === 'password-resets' ? 'border-b-4 border-black font-bold' : 'text-gray-600'}`}
          >
            Password Resets 
            {passwordResets.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {passwordResets.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
            {error}
          </div>
        )}

        {/* Organizers Tab */}
        {activeTab === 'organizers' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Manage Organizers</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
              >
                {showAddForm ? 'Cancel' : 'Add New Organizer'}
              </button>
            </div>

        {showAddForm && (
          <div className="border-2 border-black p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Add New Organizer</h3>
            <form onSubmit={handleAddOrganizer} className="space-y-4">
              <div>
                <label className="block mb-1 font-bold">Name</label>
                <input
                  type="text"
                  value={newOrganizer.name}
                  onChange={(e) => setNewOrganizer({...newOrganizer, name: e.target.value})}
                  className="w-full p-2 border-2 border-black"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Email</label>
                <input
                  type="email"
                  value={newOrganizer.loginEmail}
                  onChange={(e) => setNewOrganizer({...newOrganizer, loginEmail: e.target.value})}
                  className="w-full p-2 border-2 border-black"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Category</label>
                <select
                  value={newOrganizer.category}
                  onChange={(e) => setNewOrganizer({...newOrganizer, category: e.target.value})}
                  className="w-full p-2 border-2 border-black"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Technical">Technical</option>
                  <option value="Sports">Sports</option>
                  <option value="Literary">Literary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold">Password</label>
                <input
                  type="password"
                  value={newOrganizer.password}
                  onChange={(e) => setNewOrganizer({...newOrganizer, password: e.target.value})}
                  className="w-full p-2 border-2 border-black"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
              >
                Add Organizer
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading organizers...</p>
        ) : organizers.length === 0 ? (
          <div className="border-2 border-black p-6">
            <p>No organizers found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {organizers.map(organizer => (
              <div key={organizer._id} className="border-2 border-black p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{organizer.name}</h3>
                    <p className="text-sm mb-1"><strong>Email:</strong> {organizer.loginEmail}</p>
                    <p className="text-sm mb-1">
                      <strong>Status:</strong>{' '}
                      <span className={`px-2 py-1 text-xs border-2 ${
                        organizer.active 
                          ? 'border-green-500 bg-green-100' 
                          : 'border-red-500 bg-red-100'
                      }`}>
                        {organizer.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </p>
                    <p className="text-sm">
                      <strong>Created:</strong> {new Date(organizer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {organizer.active ? (
                      <button
                        onClick={() => handleToggleStatus(organizer._id)}
                        className="px-3 py-1 bg-yellow-600 text-white border-2 border-yellow-700 hover:bg-yellow-700 text-sm"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(organizer._id)}
                        className="px-3 py-1 bg-green-600 text-white border-2 border-green-700 hover:bg-green-700 text-sm"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(organizer._id)}
                      className="px-3 py-1 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 text-sm"
                      >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {/* Password Resets Tab */}
        {activeTab === 'password-resets' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Password Reset Requests</h2>
            
            {passwordResets.length === 0 ? (
              <div className="border-2 border-black p-6">
                <p>No password reset requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {passwordResets.map(request => (
                  <div key={request._id} className="border-2 border-black p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {request.organizer?.name || 'Unknown Organizer'}
                        </h3>
                        <p className="text-sm mb-1">
                          <strong>Email:</strong> {request.organizer?.loginEmail}
                        </p>
                        <p className="text-sm mb-1">
                          <strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm mb-1">
                          <strong>Status:</strong>{' '}
                          <span className={`px-2 py-1 text-xs border-2 ${
                            request.status === 'pending' 
                              ? 'border-yellow-500 bg-yellow-100'
                              : request.status === 'approved'
                              ? 'border-green-500 bg-green-100'
                              : 'border-red-500 bg-red-100'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </p>
                        {request.adminComment && (
                          <p className="text-sm mt-2">
                            <strong>Admin Comment:</strong> {request.adminComment}
                          </p>
                        )}
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveReset(request._id)}
                            className="px-3 py-1 bg-green-600 text-white border-2 border-green-700 hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectReset(request._id)}
                            className="px-3 py-1 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
