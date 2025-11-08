import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api'; // Add this import

type User = {
  userEmail: string;
  isAdmin: boolean;
  firstName?: string;
  lastName?: string;
  homeLocation?: string;
  token?: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    userEmail: string;
    password: string;
    firstName: string;
    lastName: string;
    homeLocation: string;
  }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on initial load and route changes
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Retrieved token:', token); // Debug log
        
        if (!token) {
          console.log('No token available - logging out');
          handleLogout();
          return;
        }

        // Use environment-based URL
        const response = await fetch(API_ENDPOINTS.AUTH_CHECK, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Auth check response status:', response.status); // Debug log
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Auth check failed:', response.status, errorData);
          handleLogout();
          return;
        }

        const userData = await response.json();
        console.log('User data received:', userData); // Debug log
        
        setUser({
          userEmail: userData.userEmail,
          isAdmin: userData.isAdmin,
          firstName: userData.firstName,
          lastName: userData.lastName,
          homeLocation: userData.homeLocation,
          token
        });

        if (location.pathname === '/') {
          navigate('/heli');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const login = async (userEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use environment-based URL
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      console.log('Login response:', data); // Keep this for debugging

      // Check if we have a token in either location
      const authToken = data.token || 
                       (data.user?.tokens?.length > 0 ? data.user.tokens[0].token : null);

      if (!authToken) {
        throw new Error('No authentication token received from server');
      }

      localStorage.setItem('token', authToken);
      
      setUser({
        userEmail: data.user.userEmail,
        isAdmin: data.user.isAdmin,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        homeLocation: data.user.homeLocation,
        token: authToken
      });
      
      navigate('/heli');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const register = async (userData: {
    userEmail: string;
    password: string;
    firstName: string;
    lastName: string;
    homeLocation: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use environment-based URL
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Note: You'll need to add this endpoint to your API_ENDPOINTS config
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password reset failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Note: You'll need to add this endpoint to your API_ENDPOINTS config
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD(resetToken), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password reset failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register,
        requestPasswordReset,
        resetPassword,
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