// AuthContext - Global state for user authentication
// This makes user info available to ALL components without passing props

import { createContext, useState, useEffect } from 'react';
import { getParticipantProfile } from '../utils/api';

// Create the context
export const AuthContext = createContext();

// Provider component - wraps your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile from backend
      getParticipantProfile()
        .then(data => {
          setUser(data.user);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err);
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login function - saves token and user data
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Logout function - clears everything
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Value provided to all components
  const value = {
    user,       // Current user data
    loading,    // Is authentication check in progress?
    login,      // Function to login
    logout,     // Function to logout
    isAuthenticated: !!user  // Boolean: is user logged in?
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// EXPLANATION:
// - createContext() creates a "container" for global state
// - AuthProvider wraps your app and provides user data to all components
// - useEffect runs once when app loads to check if token exists
// - login() saves token to localStorage and updates user state
// - logout() clears everything
// - All child components can access: user, loading, login, logout, isAuthenticated
