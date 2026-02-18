/**
 * User profile page showing all user details from /api/me.
 */
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../config';

interface MeResponse {
  message?: string;
  user?: Record<string, unknown>;
  merchants?: { id: string; name: string; vatNumber?: string }[];
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(BASE_URL.includes('ngrok') && { 'ngrok-skip-browser-warning': '1' }),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const user = data?.user;
  const displayName =
    (user?.name as string) ||
    [user?.given_name, user?.family_name].filter(Boolean).join(' ') ||
    (user?.email as string) ||
    (user?.sub as string) ||
    t('menu.guest');

  const userFields = [
    { key: 'sub', label: 'Subject ID' },
    { key: 'name', label: 'Name' },
    { key: 'given_name', label: 'Given name' },
    { key: 'family_name', label: 'Family name' },
    { key: 'email', label: 'Email' },
    { key: 'merchantIds', label: 'Merchant IDs' },
  ];

  return (
    <IonPage>
      <HeaderBar title={t('menu.profile')} />
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
              <p>Error: {error}</p>
            </IonCardContent>
          </IonCard>
        )}
        {data && !loading && (
          <>
            {data.message && (
              <IonCard>
                <IonCardContent>
                  <p style={{ margin: 0, color: 'var(--ion-color-medium)' }}>{data.message}</p>
                </IonCardContent>
              </IonCard>
            )}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{displayName}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  <IonListHeader>User details</IonListHeader>
                  {userFields.map(({ key, label }) => {
                    const value = user?.[key];
                    if (value === undefined || value === null) return null;
                    const display =
                      Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
                    return (
                      <IonItem key={key}>
                        <IonLabel>
                          <h3 style={{ fontWeight: 600, marginBottom: 2 }}>{label}</h3>
                          <p style={{ margin: 0, color: 'var(--ion-color-medium)' }}>{display}</p>
                        </IonLabel>
                      </IonItem>
                    );
                  })}
                  {user &&
                    Object.keys(user)
                      .filter((k) => !userFields.some((f) => f.key === k))
                      .map((key) => {
                        const value = user[key];
                        if (value === undefined || value === null) return null;
                        const display =
                          Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
                        return (
                          <IonItem key={key}>
                            <IonLabel>
                              <h3 style={{ fontWeight: 600, marginBottom: 2 }}>{key}</h3>
                              <p style={{ margin: 0, color: 'var(--ion-color-medium)' }}>{display}</p>
                            </IonLabel>
                          </IonItem>
                        );
                      })}
                </IonList>
              </IonCardContent>
            </IonCard>
            {data.merchants && data.merchants.length > 0 && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Merchants</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="none">
                    {data.merchants.map((m) => (
                      <IonItem key={m.id}>
                        <IonLabel>
                          <h3 style={{ fontWeight: 600 }}>{m.name}</h3>
                          <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>
                            {m.id} {m.vatNumber && `• ${m.vatNumber}`}
                          </p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
