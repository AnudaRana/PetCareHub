import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  // Restore user from token on mount / token change
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          email: decoded.sub,
          roles: decoded.roles || [],           // already array from your JwtUtil
          userId: decoded.userId || null
        });
      } catch (err) {
        console.error('Invalid token', err);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, email: userEmail, fullName, roles } = res.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);

      return { success: true, roles };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Login failed. Please check your credentials.';
      console.error('Login error:', message);
      throw new Error(message); // now throws → easier to handle in UI
    }
  };

  const register = async (userData) => {
    try {
      // IMPORTANT: do NOT send roles – backend sets ROLE_OWNER by default
      // Remove { ...userData, roles: ['ROLE_OWNER'] }
      const res = await axios.post('/api/auth/register', userData);

      console.log('Registration successful:', res.data);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Registration failed';
      console.error('Registration error:', err.response?.status, message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => user?.roles?.includes(`ROLE_${role}`) || false;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);