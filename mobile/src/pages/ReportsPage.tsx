import React, { useState } from 'react';
import { IonContent, IonPage, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState(false);
  const todaySales = 0;

  const handleExport = () => {
    setToast(true);
  };

  return (
    <IonPage>
      <HeaderBar title={t('reports.title')} />
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t('reports.todaySales')}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{formatCents(todaySales)}</p>
          </IonCardContent>
        </IonCard>
        <IonButton expand="block" onClick={handleExport}>{t('reports.exportCsv')}</IonButton>
        <IonToast isOpen={toast} onDidDismiss={() => setToast(false)} message={t('reports.exportSuccess')} duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default ReportsPage;
