import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { refreshTokenCall } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);
  const [isTokenExpired, setIsTokenExpired] = useState(() => localStorage.getItem('isTokenExpired') === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsTokenExpired(false);
      localStorage.clear();
    };

    const handleTokenExpired = () => {
      setIsTokenExpired(true);
      localStorage.setItem('isTokenExpired', 'true');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:token-expired', handleTokenExpired);
    setLoading(false);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { user: userData, accessToken: newAccess, refreshToken: newRefresh } = response.data;

      setUser(userData);
      setAccessToken(newAccess);
      setRefreshToken(newRefresh);
      setIsTokenExpired(false);

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', newAccess);
      localStorage.setItem('refreshToken', newRefresh);
      localStorage.removeItem('isTokenExpired');

      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const renewSessionToken = async () => {
    try {
      const newAccess = await refreshTokenCall();
      setAccessToken(newAccess);
      setIsTokenExpired(false);
      return { success: true };
    } catch (err) {
      logout();
      return { success: false, message: 'Session expired. Please log in again.' };
    }
  };

  const logout = async () => {
    try {
      const currentRefresh = localStorage.getItem('refreshToken');
      if (currentRefresh) {
        await api.post('/logout', { refreshToken: currentRefresh });
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.clear();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsTokenExpired(false);
    }
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase());
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Simulate token expiration to demonstrate blocking tasks
  const simulateExpireToken = () => {
    const invalidToken = 'EXPIRED_TOKEN_SIGNATURE';
    localStorage.setItem('accessToken', invalidToken);
    localStorage.setItem('isTokenExpired', 'true');
    setAccessToken(invalidToken);
    setIsTokenExpired(true);
    window.dispatchEvent(new Event('auth:token-expired'));
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isTokenExpired,
    loading,
    login,
    logout,
    renewSessionToken,
    hasRole,
    hasPermission,
    simulateExpireToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
