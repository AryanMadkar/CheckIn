// src/contexts/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';
import { useApp } from './AppContext';

const AuthContext = createContext();

const initialState = {
  user: null,
  organization: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: false,
  loading: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        organization: action.payload.organization,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false };
    case 'LOGOUT':
      return {
        ...initialState,
        accessToken: null,
      };
    case 'UPDATE_TOKEN':
      return { ...state, accessToken: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { setError, addNotification } = useApp();

  useEffect(() => {
    if (state.accessToken) {
      // Verify token on app start
      verifyToken();
    }
  }, []);

  const verifyToken = async () => {
    try {
      // This would be a verify endpoint on your backend
      const response = await authService.verifyToken();
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data,
        });
      }
    } catch (error) {
      logout();
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      
      localStorage.setItem('accessToken', response.accessToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });
      
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'Successfully logged in.',
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const registerOrganization = async (data) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.registerOrganization(data);
      
      localStorage.setItem('accessToken', response.accessToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });
      
      addNotification({
        type: 'success',
        title: 'Organization Created!',
        message: 'Your organization has been successfully registered.',
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (data) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.registerUser(data);
      
      localStorage.setItem('accessToken', response.accessToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });
      
      addNotification({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to the team.',
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      dispatch({ type: 'LOGOUT' });
      addNotification({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
      });
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      localStorage.setItem('accessToken', response.accessToken);
      dispatch({ type: 'UPDATE_TOKEN', payload: response.accessToken });
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    ...state,
    login,
    registerOrganization,
    registerUser,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
