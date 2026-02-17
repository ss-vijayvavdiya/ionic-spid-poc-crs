import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonToast,
  IonSpinner,
  IonBadge,
  IonAlert,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';
import { useMerchant } from '../contexts/MerchantContext';
import { getReceipt, voidReceipt, refundReceipt } from '../api/receipts';
import type { Receipt } from '../types';

const ReceiptDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation<{ fromCheckout?: boolean }>();
  const fromCheckout = location.state?.fromCheckout ?? false;
  const { merchantId } = useMerchant();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [confirmAction, setConfirmAction] = useState<'void' | 'refund' | null>(null);

  const loadReceipt = useCallback(() => {
    if (!merchantId || !id) return;
    return getReceipt(id!, merchantId)
      .then(setReceipt)
      .catch(() => setToast(t('common.error')))
      .finally(() => setLoading(false));
  }, [merchantId, id, t]);

  useEffect(() => {
    if (!merchantId || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadReceipt();
  }, [merchantId, id, loadReceipt]);

  const handleVoid = async () => {
    if (!merchantId || !id) return;
    try {
      const updated = await voidReceipt(id, merchantId);
      setReceipt(updated);
      setToast(t('receipts.void') + ' ' + t('common.saved'));
    } catch {
      setToast(t('common.error'));
    }
    setConfirmAction(null);
  };

  const handleRefund = async () => {
    if (!merchantId || !id) return;
    try {
      const updated = await refundReceipt(id, merchantId);
      setReceipt(updated);
      setToast(t('receipts.refund') + ' ' + t('common.saved'));
    } catch {
      setToast(t('common.error'));
    }
    setConfirmAction(null);
  };

  const handleAction = (action: string) => {
    if (action === 'void') setConfirmAction('void');
    else if (action === 'refund') setConfirmAction('refund');
    else setToast(t('receipts.requiresInternet'));
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

  const statusColor = receipt.status === 'COMPLETED' ? 'success' : receipt.status === 'VOIDED' ? 'danger' : 'warning';
  const canVoidRefund = receipt.status === 'COMPLETED';

  return (
    <IonPage>
      <HeaderBar title={t('receipts.detail')} />
      <IonContent className={`ion-padding ${fromCheckout ? 'receipt-success-flash' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <p style={{ margin: 0 }}><strong>{receipt.number ?? id}</strong></p>
          <IonBadge color={statusColor}>{t(`receipts.status.${(receipt.status || 'COMPLETED').toLowerCase()}`)}</IonBadge>
        </div>
        <p style={{ color: 'var(--ion-color-medium)', margin: 0 }}>{new Date(receipt.issuedAt).toLocaleString()}</p>
        <IonList style={{ marginTop: '1rem' }}>
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
        <IonButton expand="block" fill="outline" onClick={() => handleAction('send')}>{t('receipts.send')}</IonButton>
        <IonButton expand="block" fill="outline" onClick={() => handleAction('print')}>{t('receipts.print')}</IonButton>
        <IonButton expand="block" color="warning" disabled={!canVoidRefund} onClick={() => handleAction('void')}>{t('receipts.void')}</IonButton>
        <IonButton expand="block" color="medium" disabled={!canVoidRefund} onClick={() => handleAction('refund')}>{t('receipts.refund')}</IonButton>

        <IonAlert
          isOpen={confirmAction === 'void'}
          onDidDismiss={() => setConfirmAction(null)}
          header={t('receipts.void')}
          message={t('receipts.confirmVoid')}
          buttons={[
            { text: t('common.cancel'), role: 'cancel' },
            { text: t('receipts.void'), role: 'destructive', handler: handleVoid },
          ]}
        />
        <IonAlert
          isOpen={confirmAction === 'refund'}
          onDidDismiss={() => setConfirmAction(null)}
          header={t('receipts.refund')}
          message={t('receipts.confirmRefund')}
          buttons={[
            { text: t('common.cancel'), role: 'cancel' },
            { text: t('receipts.refund'), role: 'destructive', handler: handleRefund },
          ]}
        />
        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default ReceiptDetailPage;
