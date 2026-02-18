// Event Details Page - Single event with registration
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { getEventById } from '../utils/api';
import axios from 'axios';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  
  const [selectedVariant, setSelectedVariant] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [customFormData, setCustomFormData] = useState({});

  // For discussion forum
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event && isAuthenticated) {
      checkRegistration();
      fetchMessages();
    }
    // Check if current user is the organizer
    if (event) {
      const orgToken = localStorage.getItem('organizerToken');
      if (orgToken) {
        setIsOrganizer(true);
        fetchMessages(orgToken);
      }
    }
  }, [event, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      const data = await getEventById(id);
      setEvent(data.event);
      setLoading(false);
    } catch (err) {
      setError('Failed to load event');
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('https://dassass.onrender.com/api/registrations/my-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const regs = response.data.registrations || [];
      const found = regs.find(r => r.eventId?._id === id);
      setIsRegistered(!!found);
    } catch (err) {
      console.error('Failed to check registration');
    }
  };

  const fetchMessages = async (orgToken) => {
    const token = orgToken || localStorage.getItem('organizerToken') || localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`https://dassass.onrender.com/api/events/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Debug: log user object
    console.log('User object:', user);
    console.log('User participantType:', user?.participantType);
    console.log('Event eligibility:', event.eligibility);

    // Check eligibility
    if (event.eligibility === 'iiit-only' && user?.participantType !== 'iiit') {
      setError(`This event is for IIIT students only. Your type: ${user?.participantType || 'unknown'}`);
      return;
    }

    setRegistering(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const body = { formData: customFormData };
      
      if (event.eventType === 'merchandise') {
        if (!selectedVariant) {
          setError('Please select a variant');
          setRegistering(false);
          return;
        }
        if (!paymentProof) {
          setError('Please provide payment proof URL');
          setRegistering(false);
          return;
        }
        body.merchVariant = selectedVariant;
        body.paymentProof = paymentProof;
      }

      // Validate required custom fields
      if (event.customForm?.fields?.length > 0) {
        for (const field of event.customForm.fields) {
          if (field.required && !customFormData[field.name]) {
            setError(`Please fill required field: ${field.name}`);
            setRegistering(false);
            return;
          }
        }
      }

      await axios.post(
        `https://dassass.onrender.com/api/registrations/events/${id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (event.eventType === 'merchandise') {
        alert('Order placed! Waiting for payment approval.');
      } else {
        alert('Registration successful! Check your email for the ticket.');
      }
      navigate('/my-registrations');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setRegistering(false);
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('organizerToken') || localStorage.getItem('token');
    try {
      await axios.post(
        `https://dassass.onrender.com/api/events/${id}/messages`,
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

    const token = localStorage.getItem('organizerToken') || localStorage.getItem('token');
    try {
      await axios.post(
        `https://dassass.onrender.com/api/events/${id}/messages`,
        { message: replyText, parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText('');
      setReplyTo(null);
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleReaction = async (messageId, emoji) => {
    const token = localStorage.getItem('organizerToken') || localStorage.getItem('token');
    try {
      await axios.post(
        `https://dassass.onrender.com/api/messages/${messageId}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages();
    } catch (err) {
      console.error('Failed to react');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Event not found</p>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = new Date() > new Date(event.regDeadline);
  const isLimitReached = event.regLimit > 0 && event.currentRegistrations >= event.regLimit;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border-2 border-black p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <span className={`px-3 py-1 border-2 ${
              event.eventType === 'merchandise' ? 'border-purple-500 bg-purple-100' : 'border-blue-500 bg-blue-100'
            }`}>
              {event.eventType.toUpperCase()}
            </span>
          </div>
          
          <div className="mb-6">
            <p className="mb-4">{event.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Fee:</strong> ₹{event.regFee || 0}</p>
                <p><strong>Eligibility:</strong> {event.eligibility === 'iiit-only' ? 'IIIT Only' : 'Open to All'}</p>
                <p><strong>Registrations:</strong> {event.currentRegistrations} / {event.regLimit || '∞'}</p>
              </div>
              <div>
                <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
                <p><strong>Deadline:</strong> {new Date(event.regDeadline).toLocaleDateString()}</p>
              </div>
            </div>

            {event.organizerId && (
              <p className="mb-2">
                <strong>Organizer:</strong>{' '}
                <Link to={`/clubs/${event.organizerId._id}`} className="underline">
                  {event.organizerId.name}
                </Link>
              </p>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="mb-4">
                <strong>Tags:</strong>{' '}
                {event.tags.map((tag, i) => (
                  <span key={i} className="inline-block px-2 py-1 bg-gray-200 border border-black text-sm mr-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Merchandise Variants */}
          {event.eventType === 'merchandise' && event.merchDetails?.variants?.length > 0 && (
            <div className="border-t-2 border-black pt-4 mb-4">
              <h3 className="font-bold mb-2">Select Variant:</h3>
              <div className="space-y-2">
                {event.merchDetails.variants.map((variant, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="variant"
                      value={variant.name}
                      checked={selectedVariant === variant.name}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      disabled={variant.stock <= 0}
                    />
                    <span className={variant.stock <= 0 ? 'text-gray-400 line-through' : ''}>
                      {variant.name} - ₹{variant.price} ({variant.stock} left)
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <label className="block font-bold mb-2">Payment Proof:</label>
                <p className="text-sm text-gray-600 mb-2">Upload an image or provide a URL to your payment screenshot</p>
                
                {/* File Upload Option */}
                <div className="mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Convert to base64 for storage
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPaymentProof(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full border-2 border-black p-2"
                  />
                </div>
                
                <p className="text-sm text-gray-500 text-center my-2">- OR -</p>
                
                {/* URL Option */}
                <input
                  type="url"
                  value={paymentProof.startsWith('data:') ? '' : paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  placeholder="Paste URL to payment screenshot..."
                  className="w-full border-2 border-black p-2"
                />

                {/* Preview */}
                {paymentProof && (
                  <div className="mt-2">
                    <p className="text-sm font-bold mb-1">Preview:</p>
                    <img 
                      src={paymentProof} 
                      alt="Payment proof" 
                      className="max-w-xs max-h-40 border border-gray-300"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Registration Form Fields */}
          {event.customForm?.fields?.length > 0 && event.status === 'published' && !isDeadlinePassed && !isLimitReached && !isRegistered && (
            <div className="border-t-2 border-black pt-4 mb-4">
              <h3 className="font-bold mb-3">Additional Information:</h3>
              <div className="space-y-4">
                {event.customForm.fields.map((field, i) => (
                  <div key={i}>
                    <label className="block font-bold mb-1">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={customFormData[field.name] || ''}
                        onChange={(e) => setCustomFormData({...customFormData, [field.name]: e.target.value})}
                        className="w-full border-2 border-black p-2"
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={customFormData[field.name] || ''}
                        onChange={(e) => setCustomFormData({...customFormData, [field.name]: e.target.value})}
                        rows="3"
                        className="w-full border-2 border-black p-2"
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={customFormData[field.name] || ''}
                        onChange={(e) => setCustomFormData({...customFormData, [field.name]: e.target.value})}
                        className="w-full border-2 border-black p-2"
                      />
                    )}
                    {field.type === 'email' && (
                      <input
                        type="email"
                        value={customFormData[field.name] || ''}
                        onChange={(e) => setCustomFormData({...customFormData, [field.name]: e.target.value})}
                        className="w-full border-2 border-black p-2"
                      />
                    )}
                    {field.type === 'dropdown' && (
                      <select
                        value={customFormData[field.name] || ''}
                        onChange={(e) => setCustomFormData({...customFormData, [field.name]: e.target.value})}
                        className="w-full border-2 border-black p-2"
                      >
                        <option value="">Select an option</option>
                        {(field.options || []).map((opt, j) => (
                          <option key={j} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customFormData[field.name] || false}
                          onChange={(e) => setCustomFormData({...customFormData, [field.name]: e.target.checked})}
                        />
                        <span>Yes</span>
                      </label>
                    )}
                    {field.type === 'file' && (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCustomFormData({...customFormData, [field.name]: reader.result});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full border-2 border-black p-2"
                        />
                        {customFormData[field.name] && (
                          <p className="text-sm text-green-600 mt-1">✓ File uploaded</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
              {error}
            </div>
          )}

          {event.status === 'published' && !isDeadlinePassed && !isLimitReached && !isRegistered && (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="w-full bg-black text-white p-3 border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
            >
              {registering ? 'Processing...' : event.eventType === 'merchandise' ? 'Place Order' : 'Register for Event'}
            </button>
          )}

          {isRegistered && (
            <div className="bg-green-100 border-2 border-green-500 p-3">
              ✓ You are registered for this event!
            </div>
          )}

          {isDeadlinePassed && !isRegistered && (
            <p className="text-red-600 font-bold">Registration deadline has passed.</p>
          )}

          {isLimitReached && !isRegistered && (
            <p className="text-red-600 font-bold">Registration limit reached.</p>
          )}

          {event.status !== 'published' && (
            <p className="text-gray-600">This event is not open for registration.</p>
          )}
        </div>

        {/* Discussion Forum */}
        {(isRegistered || isOrganizer) && (
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-bold mb-4">Discussion Forum</h2>
            
            <form onSubmit={handlePostMessage} className="mb-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask a question or leave a comment..."
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
                {/* Show top-level messages (no parentId) */}
                {messages.filter(m => !m.parentId).map(msg => (
                  <div key={msg._id}>
                    <div className={`border-2 p-3 ${msg.pinned ? 'border-yellow-500 bg-yellow-50' : 'border-black'}`}>
                      {msg.pinned && <span className="text-xs text-yellow-700 font-bold">PINNED</span>}
                      <p className="text-sm text-gray-600">
                        {msg.userId?.firstName || msg.organizerId?.name || 'Unknown'} {msg.userId?.lastName || ''} 
                        {msg.organizerId && <span className="ml-1 px-1 py-0.5 bg-black text-white text-xs">ORGANIZER</span>}
                        {' '} • {new Date(msg.createdAt).toLocaleString()}
                      </p>
                      <p className="my-2">{msg.message}</p>
                      
                      {/* Reactions */}
                      <div className="flex items-center gap-2 mt-2">
                        {['👍', '❤️', '🎉', '😂'].map(emoji => {
                          const count = (msg.reactions || []).filter(r => r.emoji === emoji).length;
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg._id, emoji)}
                              className={`px-2 py-0.5 border text-sm hover:bg-gray-100 ${count > 0 ? 'border-black bg-gray-50' : 'border-gray-300'}`}
                            >
                              {emoji} {count > 0 && count}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setReplyTo(replyTo === msg._id ? null : msg._id)}
                          className="px-2 py-0.5 border border-gray-300 text-sm hover:bg-gray-100 ml-auto"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Reply form */}
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

                    {/* Replies (threaded) */}
                    {messages.filter(r => r.parentId === msg._id).map(reply => (
                      <div key={reply._id} className="ml-8 mt-1 border-2 border-gray-400 p-3 bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {reply.userId?.firstName || reply.organizerId?.name || 'Unknown'} {reply.userId?.lastName || ''}
                          {reply.organizerId && <span className="ml-1 px-1 py-0.5 bg-black text-white text-xs">ORGANIZER</span>}
                          {' '} • {new Date(reply.createdAt).toLocaleString()}
                        </p>
                        <p className="my-1">{reply.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {['👍', '❤️', '🎉', '😂'].map(emoji => {
                            const count = (reply.reactions || []).filter(r => r.emoji === emoji).length;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(reply._id, emoji)}
                                className={`px-2 py-0.5 border text-xs hover:bg-gray-100 ${count > 0 ? 'border-black bg-white' : 'border-gray-300'}`}
                              >
                                {emoji} {count > 0 && count}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Link to="/events" className="px-4 py-2 border-2 border-black hover:bg-gray-100">
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
