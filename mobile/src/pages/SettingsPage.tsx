import React from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { useSync } from '../contexts/SyncContext';
import { useConnectivity } from '../contexts/ConnectivityContext';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { pendingCount, isSyncing, triggerSync } = useSync();
  const { isOnline } = useConnectivity();

  const items = [
    { path: '/settings/language', key: 'language' },
    { path: '/settings/payments', key: 'payments' },
    { path: '/settings/printer', key: 'printer' },
    { path: '/reports', key: 'reports' },
    { path: '/support', key: 'support' },
  ];

  return (
    <IonPage>
      <HeaderBar title={t('settings.title')} />
      <IonContent className="ion-padding">
        {pendingCount > 0 && (
          <div style={{ padding: '1rem', marginBottom: '1rem', background: 'var(--ion-color-light)', borderRadius: 8 }}>
            <p style={{ margin: '0 0 0.5rem' }}>{t('settings.pendingSync', { count: pendingCount })}</p>
            <IonButton size="small" disabled={!isOnline || isSyncing} onClick={() => triggerSync()}>
              {isSyncing ? t('common.loading') : t('common.retry')}
            </IonButton>
          </div>
        )}
        <IonList>
          {items.map((item) => (
            <IonItem key={item.path} button onClick={() => history.push(item.path)}>
              <IonLabel>{t(`settings.${item.key}`)}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
