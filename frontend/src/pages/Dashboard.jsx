// Participant Dashboard - My Events with tabs
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchRegistrations();
  }, [isAuthenticated, navigate]);

  const fetchRegistrations = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get('http://localhost:5000/api/registrations/my-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data.registrations || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load registrations');
      setLoading(false);
    }
  };

  const handleExportCalendar = async (regId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `http://localhost:5000/api/registrations/${regId}/calendar`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event.ics');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export calendar');
    }
  };

  // Filter registrations by tab
  const now = new Date();
  
  const upcomingRegs = registrations.filter(reg => {
    if (!reg.eventId) return false;
    const eventDate = new Date(reg.eventId.startDate);
    return eventDate > now && reg.status === 'confirmed';
  });

  const normalRegs = registrations.filter(reg => 
    reg.registrationType === 'normal' && reg.status === 'confirmed'
  );

  const merchRegs = registrations.filter(reg => 
    reg.registrationType === 'merchandise'
  );

  const completedRegs = registrations.filter(reg => {
    if (!reg.eventId) return false;
    return reg.eventId.status === 'completed' || reg.attended;
  });

  const cancelledRegs = registrations.filter(reg => 
    reg.status === 'cancelled' || reg.status === 'rejected'
  );

  const getFilteredRegs = () => {
    switch (activeTab) {
      case 'upcoming': return upcomingRegs;
      case 'normal': return normalRegs;
      case 'merchandise': return merchRegs;
      case 'completed': return completedRegs;
      case 'cancelled': return cancelledRegs;
      default: return registrations;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Events Dashboard</h1>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b-2 border-black mb-6">
          {[
            { id: 'upcoming', label: `Upcoming (${upcomingRegs.length})` },
            { id: 'normal', label: `Normal (${normalRegs.length})` },
            { id: 'merchandise', label: `Merchandise (${merchRegs.length})` },
            { id: 'completed', label: `Completed (${completedRegs.length})` },
            { id: 'cancelled', label: `Cancelled (${cancelledRegs.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 -mb-0.5 border-2 border-black border-b-0 ${
                activeTab === tab.id 
                  ? 'bg-black text-white' 
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Registrations List */}
        {getFilteredRegs().length === 0 ? (
          <div className="border-2 border-black p-6">
            <p className="mb-4">No registrations in this category.</p>
            <Link to="/events" className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredRegs().map(reg => (
              <div key={reg._id} className="border-2 border-black p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/events/${reg.eventId?._id}`}>
                      <h3 className="font-bold text-lg mb-2 hover:underline">
                        {reg.eventId?.name || 'Event'}
                      </h3>
                    </Link>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <p><strong>Event Type:</strong> {reg.eventId?.eventType || reg.registrationType}</p>
                      <p><strong>Participation Status:</strong> 
                        <span className={`ml-1 px-2 py-0.5 border ${
                          reg.status === 'confirmed' ? 'border-green-500 bg-green-100' :
                          reg.status === 'pending' ? 'border-yellow-500 bg-yellow-100' :
                          'border-red-500 bg-red-100'
                        }`}>
                          {reg.status}
                        </span>
                      </p>
                      {reg.eventId?.organizerId && (
                        <p><strong>Organizer:</strong> {reg.eventId.organizerId.name || 'N/A'}</p>
                      )}
                      <p><strong>Payment:</strong> {reg.paymentStatus}</p>
                      {reg.formData?.teamName && (
                        <p><strong>Team Name:</strong> {reg.formData.teamName}</p>
                      )}
                      {reg.attended && (
                        <p className="text-green-600 font-bold">✓ Attended</p>
                      )}
                    </div>
                    
                    {reg.ticketId && (
                      <p className="text-sm mt-2">
                        <strong>Ticket ID:</strong>{' '}
                        <Link 
                          to={`/events/${reg.eventId?._id}`}
                          className="bg-gray-100 px-2 py-1 border border-black hover:bg-gray-200 cursor-pointer font-mono"
                        >
                          {reg.ticketId}
                        </Link>
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end gap-2">
                    {reg.qrCode && (
                      <img src={reg.qrCode} alt="QR Code" className="w-24 h-24 border-2 border-black" />
                    )}
                    
                    {reg.status === 'confirmed' && reg.eventId && (
                      <button
                        onClick={() => handleExportCalendar(reg._id)}
                        className="px-3 py-1 border-2 border-black hover:bg-gray-100 text-sm"
                      >
                        Add to Calendar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
