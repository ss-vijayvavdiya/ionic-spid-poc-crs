/**
 * Login page: single "Login with SPID" button.
 * Opens system browser (_system) at BASE_URL/auth/spid/start to avoid InAppBrowser
 * CSP/ngrok interstitial freeze. When Signicat redirects to our callback, the server
 * returns 302 to smartsense://, which opens the app via handleOpenURL.
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
    const res = await fetch(`${BASE_URL}/auth/dev-token`, {
      method: 'POST',
      headers: BASE_URL.includes('ngrok') ? { 'ngrok-skip-browser-warning': '1' } : undefined,
    });
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
    const cordova = (window as unknown as {
      cordova?: { InAppBrowser?: { open: (u: string, t: string) => void } };
    }).cordova;

    if (cordova?.InAppBrowser?.open) {
      // Use _system to open in external browser. Avoids InAppBrowser CSP blocking
      // ngrok assets and the ngrok interstitial freeze. Server 302 to smartsense://
      // opens the app via handleOpenURL in App.tsx.
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
      <IonContent
        className="ion-padding"
        style={{
          '--background': 'linear-gradient(180deg, #0d9488 0%, #0f766e 20%, #e0f2f1 35%, #f8fafc 50%)',
        } as React.CSSProperties}
      >
        <div className="ion-text-center" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0f2f1 100%)',
              boxShadow: '0 8px 24px rgba(13, 148, 136, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IonIcon icon={receiptOutline} style={{ fontSize: 48, color: 'var(--ion-color-primary)' }} />
          </div>
          <h2 style={{ marginTop: '1rem', fontWeight: 700, color: '#1e293b' }}>POS Receipt</h2>
          <p style={{ color: 'var(--ion-color-medium)', margin: 0, fontSize: '0.95rem' }}>Sign in to continue</p>
        </div>
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ marginTop: 0, color: 'var(--ion-color-medium)', lineHeight: 1.5 }}>
            {t('auth.loginPrompt')}
          </p>
          <IonButton expand="block" onClick={startLogin} style={{ marginTop: '1.5rem' }}>
            {t('auth.login')}
          </IonButton>
          {isLocalDev && (
            <IonButton expand="block" fill="outline" onClick={devLogin} style={{ marginTop: '0.5rem' }}>
              Dev login (skip SPID)
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
