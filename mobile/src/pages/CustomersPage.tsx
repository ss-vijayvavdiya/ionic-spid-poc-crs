import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';

const CustomersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <HeaderBar title={t('menu.customers')} />
      <IonContent className="ion-padding">
        <p>{t('common.loading')}</p>
      </IonContent>
    </IonPage>
  );
};

export default CustomersPage;
