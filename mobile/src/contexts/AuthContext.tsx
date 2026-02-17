/**
 * Auth context: JWT storage, logout, and token access for API client.
 * Never logs tokens.
 */
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getStoredToken, setStoredToken, clearStoredToken } from '../auth/storage';
import { logger } from '../utils/logging';

interface AuthContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getStoredToken());

  const setToken = useCallback((t: string | null) => {
    if (t) {
      setStoredToken(t);
      setTokenState(t);
    } else {
      clearStoredToken();
      setTokenState(null);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setTokenState(null);
    logger.info('User logged out');
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    setTokenState(getStoredToken());
  }, []);

  const value: AuthContextValue = {
    token,
    setToken,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
