/**
 * Auth context: JWT storage, logout, deep link handling, and token access.
 * Sets up handleOpenURL early (via index.html) and processes SPID callback in setupDeepLinks.
 */
import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { getStoredToken, setStoredToken, clearStoredToken } from '../auth/storage';
import { logger } from '../utils/logging';
import { setupDeepLinks, parseAuthCallback } from '../services/deepLink';
import { BASE_URL } from '../config';

interface AuthContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getStoredToken());
  const processingRef = useRef(false);

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

  useEffect(() => {
    setupDeepLinks(async (url: string) => {
      const parsed = parseAuthCallback(url);
      if (!parsed) return;
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const res = await fetch(`${BASE_URL}/auth/exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(BASE_URL.includes('ngrok') && { 'ngrok-skip-browser-warning': '1' }),
          },
          body: JSON.stringify({ code: parsed.code, state: parsed.state }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert('Login failed: ' + (err.error || res.statusText));
          return;
        }
        const data = await res.json();
        if (data.access_token) {
          setStoredToken(data.access_token);
          setTokenState(data.access_token);
        }
      } catch (e) {
        alert('Login failed: ' + (e instanceof Error ? e.message : 'Network error'));
      } finally {
        processingRef.current = false;
      }
    });
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
