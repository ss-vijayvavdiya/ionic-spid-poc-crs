/**
 * Login page: single "Login with SPID" button.
 * Opens the system browser at BASE_URL/auth/spid/start so the user can authenticate
 * with Signicat/SPID. After login, Signicat redirects to our callback; the user
 * taps "Continue in app" (custom scheme) and the app receives the URL and exchanges
 * code/state for our JWT (handled in App.tsx).
 */
import React from 'react';
import { IonContent, IonPage, IonButton, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../config';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();

  const startLogin = () => {
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
        <p style={{ marginTop: '2rem', color: '#666' }}>
          {t('auth.loginPrompt')}
        </p>
        <IonButton expand="block" onClick={startLogin} style={{ marginTop: '2rem' }}>
          {t('auth.login')}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
