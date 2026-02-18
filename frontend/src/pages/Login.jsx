// Login Page - Where users enter email and password
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { loginParticipant } from '../utils/api';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  // State to store form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload
    
    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call backend API
      const data = await loginParticipant(email, password);
      
      // Save token and user data
      login(data.token, data.user);
      
      // Redirect to participant dashboard
      navigate('/dashboard');
      
    } catch (err) {
      // Show error message from backend
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Center the form on the page */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          
          {/* Login Form Box */}
          <div className="border-2 border-black p-8">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            
            {/* Show error message if exists */}
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-4">
                <label className="block font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-black p-2"
                  placeholder="your@email.com"
                />
              </div>
              
              {/* Password Input */}
              <div className="mb-6">
                <label className="block font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black p-2"
                  placeholder="Enter password"
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white p-3 border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            {/* Sign up link */}
            <p className="mt-4 text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold underline">
                Sign up
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Login;

// KEY CONCEPTS:
// 1. useState() - Stores form data (email, password, error, loading)
// 2. onChange - Updates state when user types
// 3. onSubmit - Handles form submission
// 4. e.preventDefault() - Stops page from reloading
// 5. Conditional rendering - {error && <div>...} shows only if error exists
