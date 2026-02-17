/**
 * Root app component. Handles:
 * - Auth callback (smartsense://auth/callback) for SPID login
 * - Providers (Auth, Merchant)
 * - AppShell with IonMenu and routing
 */
import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import './i18n';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { MerchantProvider } from './contexts/MerchantContext';
import { ConnectivityProvider } from './contexts/ConnectivityContext';
import { SyncProvider } from './contexts/SyncContext';
import { UserProvider } from './contexts/UserContext';
import AppShell from './app/AppShell';
import { BASE_URL } from './config';
import { setStoredToken } from './auth/storage';

/**
 * Exchange code/state for JWT and navigate to checkout.
 */
async function exchangeAndNavigate(
  code: string,
  state: string,
  history: { replace: (path: string) => void }
): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert('Login failed: ' + (err.error || res.statusText));
    return;
  }
  const data = await res.json();
  if (data.access_token) {
    setStoredToken(data.access_token);
    history.replace('/checkout');
  }
}

const AppContent: React.FC = () => {
  const history = useHistory();
  const pendingUrlRef = useRef<string | null>(null);

  const handleCallbackUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      const state = parsed.searchParams.get('state');
      if (!code || !state) return;
      pendingUrlRef.current = null;
      exchangeAndNavigate(code, state, history);
    } catch {
      // ignore invalid URLs
    }
  };

  useEffect(() => {
    (window as unknown as { handleOpenURL?: (url: string) => void }).handleOpenURL = (url: string) => {
      pendingUrlRef.current = url;
      handleCallbackUrl(url);
    };
    const onResume = () => {
      if (pendingUrlRef.current) handleCallbackUrl(pendingUrlRef.current);
    };
    document.addEventListener('resume', onResume);
    return () => document.removeEventListener('resume', onResume);
  }, []);

  return <AppShell />;
};

import { MerchantLoader } from './components/MerchantLoader';

const App: React.FC = () => (
  <AuthProvider>
    <MerchantProvider>
      <ConnectivityProvider>
        <SyncProvider>
          <UserProvider>
            <MerchantLoader>
              <AppContent />
            </MerchantLoader>
          </UserProvider>
        </SyncProvider>
      </ConnectivityProvider>
    </MerchantProvider>
  </AuthProvider>
);

export default App;
