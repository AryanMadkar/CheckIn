// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
  });

  // Add request interceptor for auth token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor for token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        try {
          const response = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
            withCredentials: true
          });
          localStorage.setItem('accessToken', response.data.accessToken);
          return api.request(error.config);
        } catch (refreshError) {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { accessToken, user, organization } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      setOrganization(organization);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setOrganization(null);
      setIsAuthenticated(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setOrganization(response.data.organization);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Profile fetch error:', error);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [isAuthenticated]);

  return (
    <AppContext.Provider value={{
      user,
      organization,
      isAuthenticated,
      loading,
      login,
      logout,
      fetchUserProfile,
      api
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};
