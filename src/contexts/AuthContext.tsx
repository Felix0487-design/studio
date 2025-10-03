"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

interface User {
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('navidad-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('navidad-user');
    }
    setIsLoading(false);
  }, []);

  const login = (name: string) => {
    const newUser = { name };
    localStorage.setItem('navidad-user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('navidad-user');
    // For easier testing, we can clear the vote status on logout.
    // In a real app, you might want to persist votes differently.
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('navidad-voted_')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
