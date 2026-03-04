import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return null;
    try {
      const decoded = jwtDecode(storedToken);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return null;
      }
      return storedToken;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return null;
    try {
      const decoded = jwtDecode(storedToken);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null;
      }
      return {
        email: decoded.sub,
        roles: decoded.roles || [],
        userId: decoded.userId || null
      };
    } catch (err) {
      return null;
    }
  });

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

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);


  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const baseUser = {
          email: decoded.sub,
          roles: decoded.roles || [],
          userId: decoded.userId || null
        };
        setUser(baseUser);

        // Fetch full profile data async
        axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            let pfp = res.data.profilePicture;
            if (pfp && !pfp.startsWith('data:image')) {
              pfp = `data:image/jpeg;base64,${pfp}`;
            }

            setUser(prev => ({
              ...prev,
              profilePicture: pfp,
              fullName: res.data.fullName
            }));
          }).catch(err => console.error("Could not fetch full profile for context:", err));
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
      let message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        'Login failed. Please check your credentials.';

      if (typeof message === 'object') {
        message = Object.values(message).join(', ');
      }
      console.error('Login error:', message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {

      const res = await axios.post('/api/auth/register', userData);

      console.log('Registration successful:', res.data);
      return { success: true };
    } catch (err) {
      let message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        'Registration failed';

      if (typeof message === 'object') {
        message = Object.values(message).join(', ');
      }
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

  const updateContextProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole, token, updateContextProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);