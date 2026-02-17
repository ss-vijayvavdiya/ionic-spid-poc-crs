/**
 * Root app component. Sets up routing and the global handler for the custom URL scheme
 * (smartsense://auth/callback) so that when the user taps "Continue in app" on the
 * callback page, the app receives the URL and can exchange code/state for our JWT.
 */
import React, { useEffect, useRef } from 'react';
import { Route, Redirect, useHistory } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import LoginPage from './pages/LoginPage.tsx';
import HomePage from './pages/HomePage.tsx';
import { BASE_URL } from './config';

// Storage key for our JWT (so we can show Home when already logged in)
const TOKEN_KEY = 'spid_poc_access_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

const App: React.FC = () => {
  const history = useHistory();
  const pendingUrlRef = useRef<string | null>(null);

  /**
   * Parse code and state from a callback URL (either smartsense://auth/callback?code=...&state=...
   * or https://.../auth/callback?code=...&state=...) and call the backend to exchange for our JWT.
   */
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
    // Cordova custom URL scheme plugin calls window.handleOpenURL when the app is opened with smartsense://...
    (window as unknown as { handleOpenURL?: (url: string) => void }).handleOpenURL = (url: string) => {
      pendingUrlRef.current = url;
      handleCallbackUrl(url);
    };
    // If we were opened with a URL, the plugin might have set it before our handler; check on resume
    const onResume = () => {
      if (pendingUrlRef.current) {
        handleCallbackUrl(pendingUrlRef.current);
      }
    };
    document.addEventListener('resume', onResume);
    return () => document.removeEventListener('resume', onResume);
  }, []);

  return (
    <IonRouterOutlet>
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/home" component={HomePage} />
      {/* 
        Important routing behavior:
        - In the browser we want "/" to redirect to /login or /home.
        - In the Cordova/Android build, the initial path is often "/index.html"
          because the WebView loads file://android_asset/www/index.html.
        So we explicitly handle BOTH "/" and "/index.html" as our root route.
      */}
      <Route exact path="/">
        {getStoredToken() ? <Redirect to="/home" /> : <Redirect to="/login" />}
      </Route>
      <Route exact path="/index.html">
        {getStoredToken() ? <Redirect to="/home" /> : <Redirect to="/login" />}
      </Route>
    </IonRouterOutlet>
  );
};

export default App;

/**
 * Call POST /auth/exchange with code and state, store the returned JWT, then navigate to Home.
 * Used both from handleOpenURL and from any place we receive the callback URL.
 */
export async function exchangeAndNavigate(
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
    history.replace('/home');
  }
}
