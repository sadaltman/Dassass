// Manage Single Event - View registrations and details
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ManageEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  
  // Filters for participant list
  const [filters, setFilters] = useState({
    attendance: 'all', // all, attended, not-attended
    institution: 'all', // all, iiit, non-iiit
    search: '' // search by name or email
  });

  useEffect(() => {
    fetchEventDetails();
    fetchRegistrations();
    fetchAnalytics();
  }, [id]);

  // Filter registrations based on selected filters
  const filteredRegistrations = registrations.filter(reg => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName = `${reg.userId?.firstName || ''} ${reg.userId?.lastName || ''}`.toLowerCase();
      const email = (reg.userId?.email || '').toLowerCase();
      if (!fullName.includes(searchLower) && !email.includes(searchLower)) return false;
    }
    
    // Attendance filter
    if (filters.attendance === 'attended' && !reg.attended) return false;
    if (filters.attendance === 'not-attended' && reg.attended) return false;
    
    // Institution filter
    if (filters.institution === 'iiit' && reg.userId?.participantType !== 'iiit') return false;
    if (filters.institution === 'non-iiit' && reg.userId?.participantType === 'iiit') return false;
    
    return true;
  });

  // Calculate revenue
  const totalRevenue = registrations
    .filter(r => r.paymentStatus === 'approved')
    .reduce((sum, r) => sum + (event?.regFee || 0), 0);

  const fetchEventDetails = async () => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      const response = await axios.get(
        `https://dassass.onrender.com/api/events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEvent(response.data.event);
      setLoading(false);
    } catch (err) {
      setError('Failed to load event details');
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      const response = await axios.get(
        `https://dassass.onrender.com/api/registrations/event/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    }
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      const response = await axios.get(
        `https://dassass.onrender.com/api/organizers/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to export');
      return;
    }

    // Build CSV content
    const headers = ['Name', 'Email', 'Registration Date', 'Payment Status', 'Attendance', 'Ticket ID'];
    const rows = registrations.map(reg => [
      `${reg.userId?.firstName || ''} ${reg.userId?.lastName || ''}`,
      reg.userId?.email || '',
      new Date(reg.createdAt).toLocaleDateString(),
      reg.paymentStatus || 'N/A',
      reg.attended ? 'Present' : 'Absent',
      reg.ticketId || 'N/A'
    ]);

    // Add custom field data if present
    if (registrations.some(r => r.customFormData && Object.keys(r.customFormData).length > 0)) {
      const customKeys = [...new Set(registrations.flatMap(r => Object.keys(r.customFormData || {})))];
      customKeys.forEach(key => headers.push(key));
      rows.forEach((row, i) => {
        const reg = registrations[i];
        customKeys.forEach(key => {
          row.push(reg.customFormData?.[key] || '');
        });
      });
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event?.name || 'event'}_registrations.csv`;
    link.click();
  };

  const handlePublish = async () => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.put(
        `https://dassass.onrender.com/api/events/${id}`,
        { status: 'published' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Event published successfully!');
      fetchEventDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish event');
    }
  };

  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.put(
        `https://dassass.onrender.com/api/events/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Event status changed to ${newStatus}!`);
      fetchEventDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change event status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.delete(
        `https://dassass.onrender.com/api/events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Event deleted successfully');
      navigate('/organizer/my-events');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) return <div className="min-h-screen bg-white p-8">Loading...</div>;
  if (error) return <div className="min-h-screen bg-white p-8 text-red-600">{error}</div>;
  if (!event) return <div className="min-h-screen bg-white p-8">Event not found</div>;

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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
            <span className={`px-3 py-1 text-sm border-2 ${
              event.status === 'published' 
                ? 'border-green-500 bg-green-100'
                : event.status === 'ongoing'
                ? 'border-blue-500 bg-blue-100'
                : event.status === 'completed'
                ? 'border-purple-500 bg-purple-100'
                : event.status === 'closed'
                ? 'border-red-500 bg-red-100'
                : 'border-yellow-500 bg-yellow-100'
            }`}>
              {event.status.toUpperCase()}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {event.status === 'draft' && (
              <>
                <button
                  onClick={() => navigate(`/organizer/events/${id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700"
                >
                  Edit Event
                </button>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white border-2 border-green-700 hover:bg-green-700"
                >
                  Publish Event
                </button>
              </>
            )}
            {event.status === 'published' && (
              <button
                onClick={() => handleStatusChange('ongoing')}
                className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700"
              >
                Mark Ongoing
              </button>
            )}
            {(event.status === 'published' || event.status === 'ongoing') && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-4 py-2 bg-purple-600 text-white border-2 border-purple-700 hover:bg-purple-700"
              >
                Mark Completed
              </button>
            )}
            {event.status !== 'draft' && event.status !== 'closed' && (
              <button
                onClick={() => handleStatusChange('closed')}
                className="px-4 py-2 bg-gray-600 text-white border-2 border-gray-700 hover:bg-gray-700"
              >
                Close Event
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700"
            >
              Delete Event
            </button>
          </div>
        </div>

        {/* Event Details */}
        <div className="border-2 border-black p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Event Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-bold">Event Type:</p>
              <p>{event.eventType}</p>
            </div>
            <div>
              <p className="font-bold">Eligibility:</p>
              <p>{event.eligibility}</p>
            </div>
            <div>
              <p className="font-bold">Start Date:</p>
              <p>{new Date(event.startDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-bold">End Date:</p>
              <p>{new Date(event.endDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-bold">Registration Deadline:</p>
              <p>{new Date(event.regDeadline).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-bold">Registration Fee:</p>
              <p>₹{event.regFee}</p>
            </div>
            <div>
              <p className="font-bold">Max Participants:</p>
              <p>{event.regLimit || 'Unlimited'}</p>
            </div>
            <div>
              <p className="font-bold">Current Registrations:</p>
              <p>{registrations.length}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-bold mb-2">Description:</p>
            <p className="text-gray-700">{event.description}</p>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div>
              <p className="font-bold mb-2">Tags:</p>
              <div className="flex gap-2">
                {event.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-200 border border-black text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Registrations */}
        <div className="border-2 border-black p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Registrations ({registrations.length})</h2>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
            >
              Export CSV
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="border border-gray-300 p-3 text-center">
              <p className="text-2xl font-bold">{registrations.length}</p>
              <p className="text-sm text-gray-600">Total Registrations</p>
            </div>
            <div className="border border-gray-300 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {registrations.filter(r => r.attended).length}
              </p>
              <p className="text-sm text-gray-600">Attended</p>
            </div>
            <div className="border border-gray-300 p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {registrations.filter(r => r.paymentStatus === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Payments</p>
            </div>
            <div className="border border-gray-300 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {registrations.filter(r => r.paymentStatus === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="border border-gray-300 p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                ₹{totalRevenue}
              </p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4 p-3 bg-gray-50 border border-gray-300 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search by name or email..."
                className="w-full border border-black p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Attendance</label>
              <select
                value={filters.attendance}
                onChange={(e) => setFilters({...filters, attendance: e.target.value})}
                className="border border-black p-1"
              >
                <option value="all">All</option>
                <option value="attended">Attended</option>
                <option value="not-attended">Not Attended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Institution</label>
              <select
                value={filters.institution}
                onChange={(e) => setFilters({...filters, institution: e.target.value})}
                className="border border-black p-1"
              >
                <option value="all">All</option>
                <option value="iiit">IIIT Only</option>
                <option value="non-iiit">Non-IIIT Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-600">
                Showing {filteredRegistrations.length} of {registrations.length}
              </span>
            </div>
          </div>
          
          {registrations.length === 0 ? (
            <p className="text-gray-600">No registrations yet.</p>
          ) : filteredRegistrations.length === 0 ? (
            <p className="text-gray-600">No registrations match the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left p-2">Participant</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Registration Date</th>
                    <th className="text-left p-2">Payment Status</th>
                    <th className="text-left p-2">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map(reg => (
                    <tr key={reg._id} className="border-b border-gray-300">
                      <td className="p-2">{reg.userId?.firstName} {reg.userId?.lastName}</td>
                      <td className="p-2">{reg.userId?.email}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 text-xs border ${
                          reg.userId?.participantType === 'iiit' 
                            ? 'border-blue-500 bg-blue-100' 
                            : 'border-gray-500 bg-gray-100'
                        }`}>
                          {reg.userId?.participantType === 'iiit' ? 'IIIT' : 'Non-IIIT'}
                        </span>
                      </td>
                      <td className="p-2">{new Date(reg.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 text-xs border ${
                          reg.paymentStatus === 'approved' 
                            ? 'border-green-500 bg-green-100' 
                            : reg.paymentStatus === 'pending'
                            ? 'border-yellow-500 bg-yellow-100'
                            : 'border-gray-500 bg-gray-100'
                        }`}>
                          {reg.paymentStatus}
                        </span>
                      </td>
                      <td className="p-2">
                        {reg.attended ? '✓ Present' : '✗ Absent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageEvent;
