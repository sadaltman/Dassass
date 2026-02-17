// Organizer Login Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

function OrganizerLogin() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/organizers/login', {
        email,
        password
      });
      
      localStorage.setItem('organizerToken', response.data.token);
      localStorage.setItem('userType', 'organizer');
      navigate('/organizer/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          
          <div className="border-2 border-black p-8">
            <h1 className="text-3xl font-bold mb-2">Organizer Login</h1>
            <p className="text-sm mb-6 text-gray-600">Login to manage your events</p>
            
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-black p-2"
                  placeholder="organizer@email.com"
                />
              </div>
              
              <div className="mb-6">
                <label className="block font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black p-2"
                  placeholder="Enter password"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white p-3 border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
              >
                {loading ? 'Logging in...' : 'Login as Organizer'}
              </button>
            </form>
            
            <p className="mt-4 text-center text-sm">
              <Link to="/login" className="underline">
                Login as Participant
              </Link>
              {' | '}
              <Link to="/admin/login" className="underline">
                Admin Login
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default OrganizerLogin;
