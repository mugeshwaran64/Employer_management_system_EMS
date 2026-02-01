import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import type { Employee } from '../types';

interface AuthContextType {
  employee: Employee | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on refresh
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setEmployee(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      const { data } = await api.post('/login/', { email, password: pass });
      
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setEmployee(data.user);
    } catch (error) {
      console.error("Login failed", error);
      throw new Error("Invalid credentials");
    }
  };

  const signOut = () => {
    localStorage.clear();
    setEmployee(null);
  };

  const refreshUser = async () => {
    if (employee) {
      try {
         const { data } = await api.get(`/employees/${employee.id}/`);
         setEmployee(data);
         localStorage.setItem('user_data', JSON.stringify(data));
      } catch (error) {
         console.error("Failed to refresh user", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ employee, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);