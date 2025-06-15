import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type User = {
  email: string;
  isAdmin: boolean;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  error: string | null;
  verifyEmail: (email: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. First validate email format (simple check)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }

      // 2. Check if user exists in your database
      const response = await fetch(`https://wells-api.vercel.app/api/users/${email}`);
      
      if (response.status === 404) {
        setUser({ email, isAdmin: false }); // User doesn't exist but we'll still "authenticate"
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to check user');
      }

      // 3. If user exists, check admin status
      const userData = await response.json();
      setUser({
        email,
        isAdmin: userData.isAdmin || false
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      verifyEmail,
      logout,
    }}>
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