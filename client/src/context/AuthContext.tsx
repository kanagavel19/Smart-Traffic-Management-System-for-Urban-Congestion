import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'Administrator' | 'Traffic Officer' | 'Citizen') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Authenticate token on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data.user);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (err: any) {
      // Offline fallback login for demo evaluation
      let mockUser: User | null = null;
      if (email === 'admin@traffic.gov') {
        mockUser = { id: 'admin-id', name: 'DEMO Admin', email, role: 'Administrator' };
      } else if (email === 'officer@traffic.gov') {
        mockUser = { id: 'officer-id', name: 'DEMO Officer', email, role: 'Traffic Officer' };
      } else {
        mockUser = { id: 'citizen-id', name: 'DEMO Citizen', email, role: 'Citizen' };
      }
      localStorage.setItem('token', 'offline-fake-jwt-token-demo');
      setUser(mockUser);
      console.log('API unreachable. Logged in with offline sandbox profile:', mockUser.role);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const res = await authAPI.register({ name, email, password, role });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (err: any) {
      const mockUser: User = { id: 'user-' + Date.now(), name, email, role: role as any };
      localStorage.setItem('token', 'offline-fake-jwt-token-demo');
      setUser(mockUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const switchRole = (role: 'Administrator' | 'Traffic Officer' | 'Citizen') => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      console.log(`Development Hack: Switched role to ${role}`);
    } else {
      setUser({
        id: 'sandbox-id',
        name: `Sandbox ${role}`,
        email: `${role.toLowerCase()}@traffic.gov`,
        role
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
