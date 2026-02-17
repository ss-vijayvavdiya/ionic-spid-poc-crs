import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonToast,
  IonSpinner,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';
import { useMerchant } from '../contexts/MerchantContext';
import { getReceipt } from '../api/receipts';
import type { Receipt } from '../types';

const ReceiptDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { merchantId } = useMerchant();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!merchantId || !id) {
      setLoading(false);
      return;
    }
    getReceipt(id!, merchantId)
      .then(setReceipt)
      .catch(() => setToast(t('common.error')))
      .finally(() => setLoading(false));
  }, [merchantId, id, t]);

  const handleAction = (action: string) => {
    setToast(t('common.loading'));
  };

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('receipts.detail')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
        </IonContent>
      </IonPage>
    );
  }

  if (loading) {
    return (
      <IonPage>
        <HeaderBar title={t('receipts.detail')} />
        <IonContent className="ion-padding">
          <div className="ion-text-center">
            <IonSpinner name="crescent" />
            <p>{t('common.loading')}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!receipt) {
    return (
      <IonPage>
        <HeaderBar title={t('receipts.detail')} />
        <IonContent className="ion-padding">
          <p>{t('common.error')}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar title={t('receipts.detail')} />
      <IonContent className="ion-padding">
        <p><strong>{t('receipts.detail')}</strong> {receipt.number ?? id}</p>
        <p style={{ color: 'var(--ion-color-medium)' }}>{receipt.issuedAt}</p>
        <IonList>
          {receipt.items.map((item, i) => (
            <IonItem key={i}>
              <IonLabel>
                {item.name} x{item.qty} — {formatCents(item.lineTotalCents)}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <p><strong>{t('checkout.subtotal')}:</strong> {formatCents(receipt.subtotalCents)}</p>
        <p><strong>{t('checkout.tax')}:</strong> {formatCents(receipt.taxCents)}</p>
        <p><strong>{t('checkout.total')}:</strong> {formatCents(receipt.totalCents)}</p>
        <IonButton expand="block" onClick={() => handleAction('send')}>{t('receipts.send')}</IonButton>
        <IonButton expand="block" onClick={() => handleAction('print')}>{t('receipts.print')}</IonButton>
        <IonButton expand="block" color="warning" onClick={() => handleAction('void')}>{t('receipts.void')}</IonButton>
        <IonButton expand="block" color="medium" onClick={() => handleAction('refund')}>{t('receipts.refund')}</IonButton>
        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={1500} />
      </IonContent>
    </IonPage>
  );
};

export default ReceiptDetailPage;
