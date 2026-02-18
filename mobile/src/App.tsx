/**
 * Root app component. Auth callback (smartsense://) is handled in AuthContext via setupDeepLinks.
 */
import React from 'react';
import './i18n';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { MerchantProvider } from './contexts/MerchantContext';
import { ConnectivityProvider } from './contexts/ConnectivityContext';
import { SyncProvider } from './contexts/SyncContext';
import { UserProvider } from './contexts/UserContext';
import AppShell from './app/AppShell';
import { MerchantLoader } from './components/MerchantLoader';

const App: React.FC = () => (
  <AuthProvider>
    <MerchantProvider>
      <ConnectivityProvider>
        <SyncProvider>
          <UserProvider>
            <MerchantLoader>
              <AppShell />
            </MerchantLoader>
          </UserProvider>
        </SyncProvider>
      </ConnectivityProvider>
    </MerchantProvider>
  </AuthProvider>
);

export default App;
