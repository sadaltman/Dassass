// Payment Approvals for Merchandise
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';

function PaymentApprovals() {
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    const token = localStorage.getItem('organizerToken');
    
    if (!token) {
      setError('Not logged in as organizer. Please login via Organizer Login first.');
      setLoading(false);
      return;
    }
    
    // Debug: Try to decode the token to see what userType it has
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      if (payload.userType !== 'organizer') {
        setError(`Wrong account type: "${payload.userType}". You need to login as an organizer.`);
        setLoading(false);
        return;
      }
    } catch (decodeErr) {
      console.error('Could not decode token:', decodeErr);
    }
    
    try {
      const response = await axios.get(
        `${API_URL}/registrations/pending-payments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPendingPayments(response.data.orders || []);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Pending payments error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load pending payments');
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.put(
        `${API_URL}/registrations/${id}/approve-payment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment approved! QR code sent to participant.');
      fetchPendingPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason (optional):');
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.put(
        `${API_URL}/registrations/${id}/reject-payment`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment rejected.');
      fetchPendingPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject payment');
    }
  };

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
        <h1 className="text-3xl font-bold mb-6">Pending Payment Approvals</h1>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-4">
            <p className="font-bold mb-2">{error}</p>
            {(error.includes('login') || error.includes('Wrong account type')) && (
              <div className="mt-2">
                <p className="text-sm mb-2">Please login with your organizer account:</p>
                <button 
                  onClick={() => {
                    // Clear any bad tokens
                    localStorage.removeItem('organizerToken');
                    navigate('/organizer/login');
                  }}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                >
                  Go to Organizer Login
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p>Loading pending payments...</p>
        ) : pendingPayments.length === 0 ? (
          <div className="border-2 border-black p-6">
            <p>No pending payments at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map(payment => (
              <div key={payment.id || payment._id} className="border-2 border-black p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      {payment.participant?.name || 'Unknown Participant'}
                    </h3>
                    <p className="text-sm mb-1">
                      <strong>Email:</strong> {payment.participant?.email || 'N/A'}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Event:</strong> {typeof payment.event === 'object' ? (payment.event?.name || 'Unknown') : (payment.event || 'N/A')}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Variant:</strong> {typeof payment.variant === 'object' ? JSON.stringify(payment.variant) : (payment.variant || 'N/A')}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Order Date:</strong> {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                    </p>
                    {payment.paymentProof && (
                      <div className="mt-2">
                        <p className="text-sm font-bold mb-1">Payment Proof:</p>
                        {payment.paymentProof.startsWith('data:') ? (
                          <img 
                            src={payment.paymentProof} 
                            alt="Payment proof" 
                            className="max-w-xs max-h-48 border-2 border-black cursor-pointer"
                            onClick={() => window.open(payment.paymentProof, '_blank')}
                          />
                        ) : (
                          <a 
                            href={payment.paymentProof} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="underline text-blue-600"
                          >
                            View Payment Proof
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(payment.id)}
                      className="px-4 py-2 bg-green-600 text-white border-2 border-green-700 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(payment.id)}
                      className="px-4 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="px-4 py-2 border-2 border-black hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentApprovals;
