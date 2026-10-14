'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getStoredToken, setOnUnauthorized, setStoredToken } from '@/infrastructure/http/httpClient';
import { authApi } from '@/infrastructure/auth/authApi';
import type { LoginPayload, RegisterPayload, User } from '@/types';

type AuthContextValue = {
  user: User | null;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        setIsInitializing(false);
        return;
      }
      try {
        const res = await authApi.me();
        setUser(res.user);
      } catch {
        setStoredToken(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    setStoredToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    setStoredToken(res.token);
    setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isInitializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  return ctx;
}
