'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string | undefined>;
  logout: () => void;
  startGuestMode: () => Promise<string>;
  claimGuestDocument: () => Promise<string | null>;
  clearGuestSession: () => void;
  getAuthHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || localStorage.getItem('prof_token');
    const storedUser = localStorage.getItem('user') || localStorage.getItem('prof_user');
    const storedGuestToken = localStorage.getItem('guest_token');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        localStorage.setItem('token', storedToken);
        localStorage.setItem('prof_token', storedToken);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('prof_token');
        localStorage.removeItem('user');
        localStorage.removeItem('prof_user');
      }
    } else if (storedGuestToken) {
      setGuestToken(storedGuestToken);
    }
    setLoading(false);
  }, []);

  const startGuestMode = useCallback(async (): Promise<string> => {
    try {
      const res = await api.post('/guest/session');
      const newToken = res.data.token;
      setGuestToken(newToken);
      localStorage.setItem('guest_token', newToken);
      return newToken;
    } catch (err) {
      console.error('Failed to start guest session:', err);
      throw err;
    }
  }, []);

  const clearGuestSession = useCallback(() => {
    setGuestToken(null);
    localStorage.removeItem('guest_token');
    localStorage.removeItem('guest_document_id');
  }, []);

  const claimGuestDocument = useCallback(async (): Promise<string | null> => {
    const pendingGuestToken = localStorage.getItem('guest_token');
    if (!pendingGuestToken || !token) return null;

    try {
      const res = await api.post('/guest/claim', { guestToken: pendingGuestToken });
      if (res.data.success && res.data.documentId) {
        clearGuestSession();
        return res.data.documentId;
      }
    } catch (err) {
      console.warn('Could not claim guest document:', err);
    }
    return null;
  }, [token, clearGuestSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('prof_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('prof_user', JSON.stringify(newUser));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: newToken, user: newUser, message } = res.data;

    if (newToken) {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('prof_token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('prof_user', JSON.stringify(newUser));
    }

    return message;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('prof_token');
    localStorage.removeItem('user');
    localStorage.removeItem('prof_user');
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    if (guestToken) {
      return { Authorization: `Bearer ${guestToken}` };
    }
    return {};
  }, [token, guestToken]);

  const isAuthenticated = !!token && !!user;
  const isGuest = !isAuthenticated && !!guestToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isGuest,
        guestToken,
        loading,
        login,
        register,
        logout,
        startGuestMode,
        claimGuestDocument,
        clearGuestSession,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
