import React from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

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
