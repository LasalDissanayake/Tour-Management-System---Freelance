import { createContext, useContext, useCallback, useState } from 'react';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Create the auth context
const AuthContext = createContext({
  authState: initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  clearError: () => {}
});

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialState);

  // Check if user is already authenticated
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await axios.get(`${API_URL}/auth/profile`, { withCredentials: true });
      
      if (response.data && response.data.user) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return response.data.user;
      } else {
        setAuthState({
          ...initialState,
          isLoading: false
        });
        return null;
      }
    } catch (error) {
      setAuthState({
        ...initialState,
        isLoading: false,
        error: error.response?.data?.message || 'Authentication check failed'
      });
      throw error;
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await axios.post(
        `${API_URL}/auth/login`, 
        credentials, 
        { withCredentials: true }
      );
      
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Login failed'
      }));
      throw error;
    }
  };

  // Register function
  const register = async (data) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await axios.post(
        `${API_URL}/auth/register`, 
        data,
        { withCredentials: true }
      );
      
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed'
      }));
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`, 
        {}, 
        { withCredentials: true }
      );
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Logout failed'
      }));
    }
  };

  // Clear error
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        checkAuth,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
