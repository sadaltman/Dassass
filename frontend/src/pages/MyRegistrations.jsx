import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyRegistrations, API_URL } from '../utils/api';
import axios from 'axios';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyRegistrations()
      .then(data => {
        setRegistrations(data.registrations);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load registrations');
        setLoading(false);
      });
  }, []);

  const handleAddToCalendar = async (regId, eventName) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${API_URL}/registrations/${regId}/calendar`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${eventName.replace(/\s+/g, '_')}.ics`;
      link.click();
    } catch (err) {
      alert('Failed to download calendar file');
    }
  };

  const getGoogleCalendarUrl = (event) => {
    if (!event) return '#';
    const start = new Date(event.startDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = new Date(event.endDate || event.startDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name || '',
      dates: `${start}/${end}`,
      details: event.description || '',
      location: event.venue || ''
    });
    return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
  };

  const getOutlookCalendarUrl = (event) => {
    if (!event) return '#';
    const start = new Date(event.startDate).toISOString();
    const end = new Date(event.endDate || event.startDate).toISOString();
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.name || '',
      startdt: start,
      enddt: end,
      body: event.description || '',
      location: event.venue || ''
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p>Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Registrations</h1>
        
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        {registrations.length === 0 ? (
          <div className="border-2 border-black p-6">
            <p className="mb-4">You haven't registered for any events yet.</p>
            <Link to="/events" className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map(reg => (
              <div key={reg._id} className="border-2 border-black p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      {reg.eventId?.name || 'Event'}
                    </h3>
                    <p className="text-sm mb-1">
                      <strong>Registration Date:</strong> {new Date(reg.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Payment Status:</strong> {reg.paymentStatus}
                    </p>
                    {reg.ticketId && (
                      <p className="text-sm mb-1">
                        <strong>Ticket ID:</strong> {reg.ticketId}
                      </p>
                    )}
                    {reg.attended && (
                      <p className="text-sm text-green-600 font-bold">✓ Attended</p>
                    )}
                  </div>
                  
                  {reg.qrCode && (
                    <div className="ml-4">
                      <img src={reg.qrCode} alt="QR Code" className="w-32 h-32 border-2 border-black" />
                      <p className="text-xs text-center mt-1">Scan at venue</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    to={`/events/${reg.eventId?._id}`}
                    className="px-3 py-1 border-2 border-black hover:bg-gray-100 text-sm"
                  >
                    View Event
                  </Link>
                  {reg.eventId && (
                    <button
                      onClick={() => handleAddToCalendar(reg._id, reg.eventId.name)}
                      className="px-3 py-1 border-2 border-black hover:bg-gray-100 text-sm"
                    >
                      Download .ics
                    </button>
                  )}
                  {reg.eventId && (
                    <a
                      href={getGoogleCalendarUrl(reg.eventId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border-2 border-black hover:bg-gray-100 text-sm"
                    >
                      Google Calendar
                    </a>
                  )}
                  {reg.eventId && (
                    <a
                      href={getOutlookCalendarUrl(reg.eventId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border-2 border-black hover:bg-gray-100 text-sm"
                    >
                      Outlook Calendar
                    </a>
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

export default MyRegistrations;
