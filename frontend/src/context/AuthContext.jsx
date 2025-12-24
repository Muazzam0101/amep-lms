import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    return token && user ? JSON.parse(user) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(true);

  const signup = async (email, password, role) => {
    setLoading(true);
    try {
      const response = await authAPI.signup({ email, password, role });
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
      setCurrentUser(user);
      
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      // Verify role matches
      if (user.role !== role) {
        throw new Error('Invalid credentials for selected role');
      }
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
      setCurrentUser(user);
      
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    setCurrentUser(null);
  };

  const clearAllData = () => {
    logout();
    // Remove any other app-specific data
    localStorage.removeItem('amep_courses');
    localStorage.removeItem('amep_topics');
    localStorage.removeItem('contents_table');
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    clearAllData,
    loading,
    hydrated: true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};