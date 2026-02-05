import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Employee } from '../types';

interface AuthContextType {
  employee: Employee | null;
  loading: boolean;
  signIn: (token: string, employeeData: Employee) => void; // CHANGED: Accepts token + data
  signOut: () => void;
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

  // FIXED: Simply saves the data passed from Login.tsx
  const signIn = (token: string, employeeData: Employee) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(employeeData));
    setEmployee(employeeData);
  };

  const signOut = () => {
    localStorage.clear();
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ employee, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);