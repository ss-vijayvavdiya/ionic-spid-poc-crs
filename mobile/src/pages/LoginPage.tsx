/**
 * Login page: single "Login with SPID" button.
 * Opens the system browser at BASE_URL/auth/spid/start so the user can authenticate
 * with Signicat/SPID. After login, Signicat redirects to our callback; the user
 * taps "Continue in app" (custom scheme) and the app receives the URL and exchanges
 * code/state for our JWT (handled in App.tsx).
 */
import React from 'react';
import { IonContent, IonPage, IonButton, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { BASE_URL } from '../config';

const LoginPage: React.FC = () => {
  const startLogin = () => {
    const url = `${BASE_URL}/auth/spid/start`;
    // Use system browser (_system) so cookies and redirects work like in a real browser.
    // cordova-plugin-inappbrowser provides cordova.InAppBrowser.open
    const cordova = (window as unknown as { cordova?: { InAppBrowser?: { open: (u: string, t: string) => void } } }).cordova;
    if (cordova?.InAppBrowser?.open) {
      cordova.InAppBrowser.open(url, '_system');
    } else {
      // Fallback for web / dev: open in same tab
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
          Sign in with your SPID identity (Signicat sandbox).
        </p>
        <IonButton expand="block" onClick={startLogin} style={{ marginTop: '2rem' }}>
          Login with SPID
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
