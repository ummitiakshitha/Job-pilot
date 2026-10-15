import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jobpilot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('jobpilot_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('jobpilot_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('jobpilot_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.warn('[Auth] Stored session invalid or expired');
          logout();
        }
      }
      setLoading(false);
    };

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('jobpilot:auth_expired', handleAuthExpired);
    initAuth();

    return () => {
      window.removeEventListener('jobpilot:auth_expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const { user: userData, token: authToken } = res.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('jobpilot_token', authToken);
      localStorage.setItem('jobpilot_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res.success && res.data) {
      const { user: userData, token: authToken } = res.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('jobpilot_token', authToken);
      localStorage.setItem('jobpilot_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jobpilot_token');
    localStorage.removeItem('jobpilot_user');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('jobpilot_user', JSON.stringify(updatedUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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
