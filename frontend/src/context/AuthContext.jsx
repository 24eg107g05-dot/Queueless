```jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const decoded = jwtDecode(token);

          if (decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expired');
          }

          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth init error:', error);

        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await api.post(
        '/auth/login',
        credentials
      );

      const {
        token: newToken,
        userId,
        name,
        email,
        role,
        user: responseUser
      } = response.data;

      if (!newToken) {
        throw new Error('Authentication token is missing');
      }

      const userData = responseUser || {
        userId,
        name,
        email,
        role
      };

      localStorage.setItem('token', newToken);
      setUser(userData);
      setToken(newToken);

      return true;
    } catch (error) {
      console.error('Login error:', error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Login failed'
      );

      return false;
    }
  };

  const register = async (data) => {
    try {
      await api.post('/auth/register', data);

      toast.success(
        'Registration successful. Please login.'
      );

      return true;
    } catch (error) {
      console.error('Registration error:', error);

      toast.error(
        error.response?.data?.message ||
        'Registration failed'
      );

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = Boolean(token);

  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```
