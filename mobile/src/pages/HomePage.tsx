/**
 * Home page: shows logged-in user details from /api/me.
 * Displays name, email, and other profile fields in a clear layout; includes raw JSON for debugging.
 */
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../config';

interface UserDetails {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  [key: string]: unknown;
}

interface MeResponse {
  message?: string;
  user?: UserDetails;
}

const HomePage: React.FC = () => {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        setMe(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);


  const user = me?.user;
  const displayName = user?.name || [user?.given_name, user?.family_name].filter(Boolean).join(' ') || user?.sub || 'User';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>Loading profile…</p>
          </div>
        )}
        {error && (
          <IonCard color="danger">
            <IonCardContent>
              <p>Error loading profile: {error}</p>
            </IonCardContent>
          </IonCard>
        )}
        {me && user && !loading && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Welcome, {displayName}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ color: 'var(--ion-color-medium)', marginBottom: '1rem' }}>
                  {me.message}
                </p>
                <IonList lines="none">
                  {user.name != null && user.name !== '' && (
                    <IonItem>
                      <IonLabel>
                        <strong>Full name</strong>
                        <p>{String(user.name)}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {(user.given_name != null && user.given_name !== '') && (
                    <IonItem>
                      <IonLabel>
                        <strong>Given name</strong>
                        <p>{String(user.given_name)}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {(user.family_name != null && user.family_name !== '') && (
                    <IonItem>
                      <IonLabel>
                        <strong>Family name</strong>
                        <p>{String(user.family_name)}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {user.email != null && user.email !== '' && (
                    <IonItem>
                      <IonLabel>
                        <strong>Email</strong>
                        <p>{String(user.email)}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {user.sub != null && (
                    <IonItem>
                      <IonLabel>
                        <strong>Subject ID</strong>
                        <p style={{ wordBreak: 'break-all', fontSize: '0.85em' }}>{String(user.sub)}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonButton
              expand="block"
              fill="outline"
              size="small"
              onClick={() => setShowRawJson((v) => !v)}
              style={{ marginTop: '0.5rem' }}
            >
              {showRawJson ? 'Hide raw JSON' : 'Show raw JSON'}
            </IonButton>
            {showRawJson && (
              <pre
                style={{
                  background: 'var(--ion-color-light)',
                  padding: '1rem',
                  overflow: 'auto',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  marginTop: '0.5rem',
                }}
              >
                {JSON.stringify(me, null, 2)}
              </pre>
            )}

            <IonButton expand="block" color="medium" onClick={logout} style={{ marginTop: '1.5rem' }}>
              Logout
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
