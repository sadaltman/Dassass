// Signup Page - Where new users register
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { signupParticipant } from '../utils/api';

function Signup() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    participantType: 'non-iiit',
    contactNumber: '',
    collegeName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes - updates the formData object
  const handleChange = (e) => {
    setFormData({
      ...formData,  // Keep existing values
      [e.target.name]: e.target.value  // Update changed field
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Allow both student (@iiit.ac.in) and faculty (@iiit.ac.in) emails
    if (formData.participantType === 'iiit' && !formData.email.includes('iiit.ac.in')) {
      setError('IIIT members must use an IIIT email (e.g., @iiit.ac.in, @students.iiit.ac.in, @research.iiit.ac.in)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call backend API
      const data = await signupParticipant(
        formData.firstName, 
        formData.lastName, 
        formData.email, 
        formData.password,
        formData.participantType,
        formData.contactNumber,
        formData.collegeName
      );
      
      // Save token and user data
      login(data.token, data.user);
      
      // Redirect to home page
      navigate('/');
      
    } catch (err) {
      // Show error message from backend
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[80vh] py-8">
        <div className="w-full max-w-md">
          
          <div className="border-2 border-black p-8">
            <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
            
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* First Name */}
              <div className="mb-4">
                <label className="block font-bold mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                  placeholder="First name"
                />
              </div>
              
              {/* Last Name */}
              <div className="mb-4">
                <label className="block font-bold mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                  placeholder="Last name"
                />
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label className="block font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                  placeholder="your@email.com"
                />
              </div>
              
              {/* Password */}
              <div className="mb-4">
                <label className="block font-bold mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                  placeholder="At least 6 characters"
                />
              </div>
              
              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block font-bold mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                  placeholder="Re-enter password"
                />
              </div>
              
              {/* Participant Type */}
              <div className="mb-4">
                <label className="block font-bold mb-2">Participant Type</label>
                <select
                  name="participantType"
                  value={formData.participantType}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                >
                  <option value="non-iiit">Non-IIIT Student</option>
                  <option value="iiit">IIIT Student</option>
                </select>
              </div>

              {/* Contact Number */}
              <div className="mb-4">
                <label className="block font-bold mb-2">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                  placeholder="Phone number"
                />
              </div>

              {/* College/Organization */}
              <div className="mb-6">
                <label className="block font-bold mb-2">College / Organization</label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2"
                  placeholder="Your college or organization"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white p-3 border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
            
            <p className="mt-4 text-center">
              Already have an account?{' '}
              <Link to="/login" className="font-bold underline">
                Login
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Signup;

// ADVANCED PATTERN:
// Instead of separate useState for each field, we use ONE object
// This is more scalable when you have many form fields
// 
// ...formData spreads existing values
// [e.target.name]: value updates specific field
