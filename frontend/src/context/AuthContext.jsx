import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getCurrentUser } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("eventnexus_token");
      
      if (storedToken) {
        setToken(storedToken);
        try {
          // Try to get user data with the stored token
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          // If backend is not available or token is invalid, clear token
          console.error('Failed to validate token:', error);
          localStorage.removeItem("eventnexus_token");
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      
      const newToken = response.token;
      const userData = response.user;
      
      if (!newToken || !userData) {
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
      
      localStorage.setItem("eventnexus_token", newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("eventnexus_token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;
