/**
 * Connectivity context. Uses Cordova network plugin when available,
 * falls back to navigator.onLine and online/offline events.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConnectivityContextValue {
  isOnline: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

function getInitialOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  if (nav.connection?.effectiveType !== undefined) return true;
  return navigator.onLine;
}

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(getInitialOnline);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const value: ConnectivityContextValue = { isOnline };

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity(): ConnectivityContextValue {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be used within ConnectivityProvider');
  return ctx;
}
