import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing token on initial load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with your API
          const response = await fetch('https://wells-api.vercel.app/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({
              userEmail: userData.userEmail,
              isAdmin: userData.isAdmin,
              firstName: userData.firstName,
              lastName: userData.lastName,
              homeLocation: userData.homeLocation,
              token
            });
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://wells-api.vercel.app/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userEmail, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setUser({
        userEmail: data.user.userEmail,
        isAdmin: data.user.isAdmin,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        homeLocation: data.user.homeLocation,
        token: data.token
      });

      // Redirect based on admin status
      navigate(data.user.isAdmin ? '/admin' : '/heli');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
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
      const response = await fetch('https://wells-api.vercel.app/api/users/register', {
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

      // Auto-login after registration if your API supports it
      // Or just show success message
      setError('Registration successful. Please wait for admin verification.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (userEmail: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://wells-api.vercel.app/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userEmail })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password reset failed');
      }

      setError('Password reset email sent. Please check your inbox.');
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
      const response = await fetch(`https://wells-api.vercel.app/api/users/reset-password/${resetToken}`, {
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

      setError('Password updated successfully. You can now login with your new password.');
      navigate('/');
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