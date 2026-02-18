/**
 * Login page: single "Login with SPID" button.
 * Opens the system browser at BASE_URL/auth/spid/start so the user can authenticate
 * with Signicat/SPID. After login, Signicat redirects to our callback; the user
 * taps "Continue in app" (custom scheme) and the app receives the URL and exchanges
 * code/state for our JWT (handled in App.tsx).
 */
import React from 'react';
import { IonContent, IonPage, IonButton, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { receiptOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { BASE_URL, validateConfig } from '../config';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { setToken } = useAuth();
  const isLocalDev = BASE_URL.startsWith('http://localhost');

  const devLogin = async () => {
    const res = await fetch(`${BASE_URL}/auth/dev-token`, { method: 'POST' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      history.replace('/merchant-select');
    }
  };

  const startLogin = () => {
    const configError = validateConfig();
    if (configError) {
      alert(configError);
      return;
    }
    const url = `${BASE_URL}/auth/spid/start`;
    const cordova = (window as unknown as { cordova?: { InAppBrowser?: { open: (u: string, t: string) => void } } }).cordova;
    if (cordova?.InAppBrowser?.open) {
      cordova.InAppBrowser.open(url, '_system');
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>SPID POC</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center" style={{ marginTop: '3rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: 'var(--ion-color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IonIcon icon={receiptOutline} style={{ fontSize: 48, color: 'white' }} />
          </div>
          <h2 style={{ marginTop: '1rem', fontWeight: 600 }}>POS Receipt</h2>
          <p style={{ color: 'var(--ion-color-medium)', margin: 0 }}>Sign in to continue</p>
        </div>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          {t('auth.loginPrompt')}
        </p>
        <IonButton expand="block" onClick={startLogin} style={{ marginTop: '2rem' }}>
          {t('auth.login')}
        </IonButton>
        {isLocalDev && (
          <IonButton expand="block" fill="outline" onClick={devLogin} style={{ marginTop: '0.5rem' }}>
            Dev login (skip SPID)
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
