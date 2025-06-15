import { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Fixed export (either option works)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);

  const login = async (username: string, password: string) => {
    // Replace with actual API call
    const mockUser = { username, role: username === 'admin' ? 'admin' : 'user' };
    setUser(mockUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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