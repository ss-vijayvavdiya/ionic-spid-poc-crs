/**
 * User profile page showing logged-in user details.
 */
import React from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import { useUser } from '../contexts/UserContext';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, displayName } = useUser();

  return (
    <IonPage>
      <HeaderBar title={t('menu.profile')} />
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel>
              <h2>{t('menu.profile')}</h2>
              <p>{displayName || t('menu.guest')}</p>
            </IonLabel>
          </IonItem>
          {user?.email && (
            <IonItem>
              <IonLabel>
                <h2>Email</h2>
                <p>{user.email}</p>
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
