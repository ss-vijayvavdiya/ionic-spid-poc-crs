import React, { useState } from 'react';
import { IonContent, IonPage, IonButton, IonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';

const PrinterSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useState(false);

  const handleTestPrint = () => {
    setToast(true);
  };

  return (
    <IonPage>
      <HeaderBar title={t('printer.title')} />
      <IonContent className="ion-padding">
        <IonButton expand="block">{t('printer.scanDevices')}</IonButton>
        <IonButton expand="block" fill="outline">{t('printer.connect')}</IonButton>
        <IonButton expand="block" fill="outline">{t('printer.disconnect')}</IonButton>
        <IonButton expand="block" onClick={handleTestPrint}>{t('printer.testPrint')}</IonButton>
        <IonToast isOpen={toast} onDidDismiss={() => setToast(false)} message={t('printer.testPrintSuccess')} duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default PrinterSettingsPage;
