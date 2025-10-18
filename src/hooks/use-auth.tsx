
// src/hooks/use-auth.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminUser } from '@/lib/types';
import { useToast } from './use-toast';
import { mockAdminUsers } from '@/lib/data';

interface AuthContextType {
  adminUser: AdminUser | null;
  adminLogin: (username: string, password?: string) => boolean;
  logout: () => void;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeJsonParse = <T>(jsonString: string | null): T | null => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON from localStorage", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only once on initial mount to load auth state from localStorage.
    try {
      const storedAdminUser = safeJsonParse<AdminUser>(localStorage.getItem('adminUser'));
      if (storedAdminUser) {
        setAdminUser(storedAdminUser);
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, []);
  
  const adminLogin = (username: string, password?: string): boolean => {
    const existingAdmin = mockAdminUsers.find(u => u.username === username && u.password === password);
    if (existingAdmin) {
      setAdminUser(existingAdmin);
      localStorage.setItem('adminUser', JSON.stringify(existingAdmin));
      toast({ title: `Welcome back, Admin!` });
      return true;
    }
    toast({ variant: 'destructive', title: 'Admin Login Failed', description: 'Invalid credentials.' });
    return false;
  }

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('tableNumber'); // Also clear table number for admins on logout
    toast({ title: 'Logged out successfully' });
    router.push('/'); // Redirect to home page after admin logout
  };

  return (
    <AuthContext.Provider value={{ adminUser, adminLogin, logout, isAuthLoading }}>
      {isAuthLoading ? (
        <div className="flex items-center justify-center h-screen bg-background"><p>Loading App...</p></div>
      ) : (
        children
      )}
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
