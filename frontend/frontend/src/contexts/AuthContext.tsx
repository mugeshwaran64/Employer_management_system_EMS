import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'; // FIXED: Added 'type'
import api from '../lib/api'; // FIXED: Added api import for refreshUser
import type { Employee } from '../types';

interface AuthContextType {
  employee: Employee | null;
  loading: boolean;
  signIn: (token: string, employeeData: Employee) => void;
  signOut: () => void;
  refreshUser: () => Promise<void>; // FIXED: Added this back
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on refresh
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_data');
    
    if (storedToken && storedUser) {
      try {
        setEmployee(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const signIn = (token: string, employeeData: Employee) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(employeeData));
    setEmployee(employeeData);
  };

  const signOut = () => {
    localStorage.clear();
    setEmployee(null);
  };

  // FIXED: Re-added refreshUser function so Profile.tsx doesn't crash
  const refreshUser = async () => {
    if (!employee) return;
    try {
      // Fetch latest data from backend
      const { data } = await api.get(`/employees/${employee.id}/`);
      
      // Update local storage and state
      localStorage.setItem('user_data', JSON.stringify(data));
      setEmployee(data);
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ employee, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);