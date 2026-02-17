/**
 * User profile context. Populated from /api/me when authenticated.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserProfile {
  sub?: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
}

interface UserContextValue {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  displayName: string;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);

  const setUser = useCallback((u: UserProfile | null) => {
    setUserState(u);
  }, []);

  const displayName =
    user?.name ||
    [user?.given_name, user?.family_name].filter(Boolean).join(' ') ||
    user?.email ||
    user?.sub ||
    '';

  const value: UserContextValue = {
    user,
    setUser,
    displayName,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
