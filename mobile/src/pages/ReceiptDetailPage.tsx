import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';

const ReceiptDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [toast, setToast] = useState(false);

  const handleAction = (action: string) => {
    setToast(true);
  };

  return (
    <IonPage>
      <HeaderBar title={t('receipts.detail')} />
      <IonContent className="ion-padding">
        <p>Receipt {id}</p>
        <IonList>
          <IonItem>
            <IonLabel>Total: 0.00 EUR</IonLabel>
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={() => handleAction('send')}>{t('receipts.send')}</IonButton>
        <IonButton expand="block" onClick={() => handleAction('print')}>{t('receipts.print')}</IonButton>
        <IonButton expand="block" color="warning" onClick={() => handleAction('void')}>{t('receipts.void')}</IonButton>
        <IonButton expand="block" color="medium" onClick={() => handleAction('refund')}>{t('receipts.refund')}</IonButton>
        <IonToast isOpen={toast} onDidDismiss={() => setToast(false)} message={t('common.loading')} duration={1500} />
      </IonContent>
    </IonPage>
  );
};

export default ReceiptDetailPage;
