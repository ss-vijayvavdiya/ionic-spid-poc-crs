import React from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonToggle } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';

const PaymentsSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <HeaderBar title={t('payments.title')} />
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel>{t('checkout.cash')}</IonLabel>
            <IonToggle checked />
          </IonItem>
          <IonItem>
            <IonLabel>{t('checkout.card')}</IonLabel>
            <IonToggle checked />
          </IonItem>
          <IonItem>
            <IonLabel>{t('checkout.wallet')}</IonLabel>
            <IonToggle />
          </IonItem>
          <IonItem>
            <IonLabel>{t('checkout.split')}</IonLabel>
            <IonToggle />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default PaymentsSettingsPage;
