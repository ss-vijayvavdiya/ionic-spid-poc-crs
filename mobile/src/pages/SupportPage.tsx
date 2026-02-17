import React from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';

const SupportPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <HeaderBar title={t('support.title')} />
      <IonContent className="ion-padding">
        <h3>{t('support.faq')}</h3>
        <IonList>
          <IonItem>
            <IonLabel>FAQ item 1</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>FAQ item 2</IonLabel>
          </IonItem>
        </IonList>
        <IonButton expand="block" href="mailto:support@example.com">{t('support.contactSupport')}</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SupportPage;
