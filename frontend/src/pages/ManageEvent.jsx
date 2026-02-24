import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';

function ManageEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  // Discussion forum state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [filters, setFilters] = useState({
    attendance: 'all',
    institution: 'all',
    search: ''
  });

  useEffect(() => {
    fetchEventDetails();
    fetchRegistrations();
    fetchAnalytics();
    fetchMessages();

    // Request browser notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Poll for new messages every 5 seconds
    const pollInterval = setInterval(() => fetchMessages(), 5000);
    return () => clearInterval(pollInterval);
  }, [id]);

  const filteredRegistrations = registrations.filter(reg => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName = `${reg.userId?.firstName || ''} ${reg.userId?.lastName || ''}`.toLowerCase();
      const email = (reg.userId?.email || '').toLowerCase();
      if (!fullName.includes(searchLower) && !email.includes(searchLower)) return false;
    }

    if (filters.attendance === 'attended' && !reg.attended) return false;
    if (filters.attendance === 'not-attended' && reg.attended) return false;

    if (filters.institution === 'iiit' && reg.userId?.participantType !== 'iiit') return false;
    if (filters.institution === 'non-iiit' && reg.userId?.participantType === 'iiit') return false;

    return true;
  });

  const totalRevenue = registrations
    .filter(r => r.paymentStatus === 'approved')
    .reduce((sum, r) => sum + (event?.regFee || 0), 0);

  const fetchEventDetails = async () => {
    const token = localStorage.getItem('organizerToken');

    try {
      const response = await axios.get(
        `${API_URL}/events/${id}`,
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
        `${API_URL}/registrations/event/${id}`,
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
        `${API_URL}/organizers/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem('organizerToken');
    if (!token) return;
    try {
      const response = await axios.get(
        `${API_URL}/events/${id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetched = response.data.messages || [];

      setMessages(prev => {
        if (fetched.length > prev.length) {
          const newMsgs = fetched.slice(prev.length);
          newMsgs.forEach(msg => {
            if (
              msg.senderRole === 'organizer' &&
              (msg.message.includes('@everyone') || msg.message.includes('@all'))
            ) {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`Event Announcement`, {
                  body: msg.message,
                  icon: '/favicon.ico'
                });
              }
            }
          });
        }
        return fetched;
      });
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('organizerToken');
    try {
      await axios.post(
        `${API_URL}/events/${id}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post message');
    }
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    const token = localStorage.getItem('organizerToken');
    try {
      await axios.post(
        `${API_URL}/events/${id}/messages`,
        { message: replyText, parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText('');
      setReplyTo(null);
      fetchMessages();
    } catch (err) {
      alert('Failed to post reply');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    const token = localStorage.getItem('organizerToken');
    try {
      await axios.delete(
        `${API_URL}/messages/${msgId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages();
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const handlePinMessage = async (msgId, currentlyPinned) => {
    const token = localStorage.getItem('organizerToken');
    try {
      await axios.put(
        `${API_URL}/messages/${msgId}/pin`,
        { pinned: !currentlyPinned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages();
    } catch (err) {
      alert('Failed to pin/unpin message');
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to export');
      return;
    }

    const headers = ['Name', 'Email', 'Registration Date', 'Payment Status', 'Attendance', 'Ticket ID'];
    const rows = registrations.map(reg => [
      `${reg.userId?.firstName || ''} ${reg.userId?.lastName || ''}`,
      reg.userId?.email || '',
      new Date(reg.createdAt).toLocaleDateString(),
      reg.paymentStatus || 'N/A',
      reg.attended ? 'Present' : 'Absent',
      reg.ticketId || 'N/A'
    ]);

    if (registrations.some(r => r.formData && Object.keys(r.formData).length > 0)) {
      const customKeys = [...new Set(registrations.flatMap(r => Object.keys(r.formData || {})))];
      customKeys.forEach(key => headers.push(key));
      rows.forEach((row, i) => {
        const reg = registrations[i];
        customKeys.forEach(key => {
          const val = reg.formData?.[key];
          row.push(val && typeof val === 'string' && val.startsWith('data:') ? '[image]' : (val || ''));
        });
      });
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

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
        `${API_URL}/events/${id}`,
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
        `${API_URL}/events/${id}`,
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
        `${API_URL}/events/${id}`,
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
            <span className={`px-3 py-1 text-sm border-2 ${event.status === 'published'
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
              <>
                <button
                  onClick={() => navigate(`/organizer/events/${id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => handleStatusChange('ongoing')}
                  className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700"
                >
                  Mark Ongoing
                </button>
              </>
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
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or email..."
                className="w-full border border-black p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Attendance</label>
              <select
                value={filters.attendance}
                onChange={(e) => setFilters({ ...filters, attendance: e.target.value })}
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
                onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
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
                    {filteredRegistrations.some(r => r.formData && Object.keys(r.formData).length > 0) &&
                      [...new Set(filteredRegistrations.flatMap(r => Object.keys(r.formData || {})))].map(key => (
                        <th key={key} className="text-left p-2">{key}</th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map(reg => {
                    const customKeys = [...new Set(filteredRegistrations.flatMap(r => Object.keys(r.formData || {})))];
                    return (
                      <tr key={reg._id} className="border-b border-gray-300">
                        <td className="p-2">{reg.userId?.firstName} {reg.userId?.lastName}</td>
                        <td className="p-2">{reg.userId?.email}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 text-xs border ${reg.userId?.participantType === 'iiit'
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-gray-500 bg-gray-100'
                            }`}>
                            {reg.userId?.participantType === 'iiit' ? 'IIIT' : 'Non-IIIT'}
                          </span>
                        </td>
                        <td className="p-2">{new Date(reg.createdAt).toLocaleDateString()}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 text-xs border ${reg.paymentStatus === 'approved'
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
                        {customKeys.map(key => {
                          const val = reg.formData?.[key];
                          return (
                            <td key={key} className="p-2">
                              {val && typeof val === 'string' && val.startsWith('data:') ? (
                                <a href={val} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">View image</a>
                              ) : (
                                String(val ?? '')
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Discussion Forum */}
        <div className="border-2 border-black p-6 mt-6">
          <h2 className="text-2xl font-bold mb-2">Discussion Forum</h2>
          <p className="text-sm text-gray-500 mb-4">
            Use <code className="bg-gray-100 px-1">@everyone</code> or <code className="bg-gray-100 px-1">@all</code> in your message to send a browser notification to all participants viewing this page.
          </p>

          <form onSubmit={handlePostMessage} className="mb-6">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Post an announcement or message to participants... (use @everyone to notify all)"
              rows="3"
              className="w-full border-2 border-black p-2 mb-2"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800"
            >
              Post Message
            </button>
          </form>

          {messages.length === 0 ? (
            <p className="text-gray-600">No messages yet. Be the first to post!</p>
          ) : (
            <div className="space-y-3">
              {messages.filter(m => !m.parentId).map(msg => (
                <div key={msg._id}>
                  <div className={`border-2 p-3 ${msg.pinned ? 'border-yellow-500 bg-yellow-50' : 'border-black'}`}>
                    {msg.pinned && <span className="text-xs text-yellow-700 font-bold">📌 PINNED</span>}
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-600">
                        <strong>{msg.senderName || 'Unknown'}</strong>
                        {msg.senderRole === 'organizer' && (
                          <span className="ml-1 px-1 py-0.5 bg-black text-white text-xs">YOU</span>
                        )}
                        {' '} • {new Date(msg.createdAt).toLocaleString()}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePinMessage(msg._id, msg.pinned)}
                          className="px-2 py-0.5 border border-gray-400 text-xs hover:bg-gray-100"
                          title={msg.pinned ? 'Unpin' : 'Pin'}
                        >
                          {msg.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="px-2 py-0.5 border border-red-400 text-red-600 text-xs hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="my-2">{msg.message}</p>
                    <button
                      onClick={() => setReplyTo(replyTo === msg._id ? null : msg._id)}
                      className="px-2 py-0.5 border border-gray-300 text-sm hover:bg-gray-100"
                    >
                      Reply
                    </button>

                    {replyTo === msg._id && (
                      <div className="mt-2 ml-4">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full border-2 border-black p-2 text-sm"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleReply(msg._id); } }}
                        />
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleReply(msg._id)} className="px-3 py-1 bg-black text-white text-sm">Reply</button>
                          <button onClick={() => { setReplyTo(null); setReplyText(''); }} className="px-3 py-1 border border-black text-sm">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {messages.filter(r => r.parentId?.toString() === msg._id?.toString()).map(reply => (
                    <div key={reply._id} className="ml-8 mt-1 border-2 border-gray-400 p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-600">
                          <strong>{reply.senderName || 'Unknown'}</strong>
                          {reply.senderRole === 'organizer' && (
                            <span className="ml-1 px-1 py-0.5 bg-black text-white text-xs">YOU</span>
                          )}
                          {' '} • {new Date(reply.createdAt).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleDeleteMessage(reply._id)}
                          className="px-2 py-0.5 border border-red-400 text-red-600 text-xs hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="my-1">{reply.message}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageEvent;
