
// src/hooks/use-auth.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AdminUser } from '@/lib/types';
import { useToast } from './use-toast';
import { mockUsers, mockAdminUsers } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  login: (phone: string) => boolean;
  adminLogin: (username: string, password?: string) => boolean;
  logout: () => void;
  register: (name: string, phone: string) => User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only once on initial mount to load auth state from localStorage.
    try {
      const storedUser = safeJsonParse<User>(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
      }
      
      const storedAdminUser = safeJsonParse<AdminUser>(localStorage.getItem('adminUser'));
      if (storedAdminUser) {
        setAdminUser(storedAdminUser);
      }

      const storedAllUsers = safeJsonParse<User[]>(localStorage.getItem('allUsers'));
      if (storedAllUsers) {
        setAllUsers(storedAllUsers);
      } else {
        setAllUsers(mockUsers);
        localStorage.setItem('allUsers', JSON.stringify(mockUsers));
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = (phone: string): boolean => {
    const existingUser = allUsers.find(u => u.phone === phone);
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('user', JSON.stringify(existingUser));
      toast({ title: `Welcome back, ${existingUser.name}!` });
      return true;
    }
    toast({ variant: 'destructive', title: 'Login Failed', description: 'User not found. Please register.' });
    return false;
  };
  
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

  const register = (name: string, phone: string): User | null => {
    const existingUser = allUsers.find(u => u.phone === phone);
    if (existingUser) {
      toast({
        variant: 'destructive',
        title: 'User already exists',
        description: 'An account with this phone number already exists. Please log in.',
      });
      return null;
    }
    
    const newUser: User = { id: `user-${Date.now()}`, name, phone };
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    toast({ title: `Welcome, ${name}!`, description: 'Your account has been created.' });
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setAdminUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('tableNumber'); // Clear table number on logout
    toast({ title: 'Logged out successfully' });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, adminUser, login, adminLogin, logout, register, isAuthLoading }}>
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
