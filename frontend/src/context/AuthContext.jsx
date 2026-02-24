

import { createContext, useState, useEffect } from 'react';
import { getParticipantProfile } from '../utils/api';

export const AuthContext = createContext(); //Create context

// Provider component wraps app
export const AuthProvider = ({ children }) => { //{childre} = props.children
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
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
  }, []); //[] = once if [user] everytime user loads

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,       
    loading,    
    login,      
    logout,     
    isAuthenticated: !!user  // Boolean 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
