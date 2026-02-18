/**
 * Reports: today's sales summary and CSV export.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonToast,
  IonSpinner,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';
import { useMerchant } from '../contexts/MerchantContext';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { fetchReceipts } from '../api/receipts';
import type { Receipt } from '../types';

function receiptsToCsv(receipts: Receipt[]): string {
  const headers = ['Number', 'Date', 'Status', 'Payment', 'Subtotal', 'Tax', 'Total', 'Items'];
  const rows = receipts.map((r) => {
    const date = new Date(r.issuedAt).toLocaleString();
    const items = r.items.map((i) => `${i.name} x${i.qty}`).join('; ');
    return [
      r.number ?? r.id,
      date,
      r.status,
      r.paymentMethod,
      (r.subtotalCents / 100).toFixed(2),
      (r.taxCents / 100).toFixed(2),
      (r.totalCents / 100).toFixed(2),
      `"${items.replace(/"/g, '""')}"`,
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const { merchantId } = useMerchant();
  const { isOnline } = useConnectivity();
  const [todaySales, setTodaySales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [exportFrom, setExportFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [exportTo, setExportTo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const loadTodaySales = useCallback(async () => {
    if (!merchantId || !isOnline) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const list = await fetchReceipts(merchantId, {
        from: todayStart.toISOString(),
        to: todayEnd.toISOString(),
        status: 'COMPLETED',
      });
      const sum = list.reduce((acc, r) => acc + r.totalCents, 0);
      setTodaySales(sum);
    } catch {
      setToast(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [merchantId, isOnline, t]);

  useEffect(() => {
    loadTodaySales();
  }, [loadTodaySales]);

  const handleExport = async () => {
    if (!merchantId || !isOnline) {
      setToast(t('receipts.requiresInternet'));
      return;
    }
    if (exportFrom > exportTo) {
      setToast(t('reports.dateRangeInvalid', 'From date must be before To date'));
      return;
    }
    try {
      const from = `${exportFrom}T00:00:00.000`;
      const to = `${exportTo}T23:59:59.999`;
      const list = await fetchReceipts(merchantId, { from, to });
      const csv = receiptsToCsv(list);
      downloadCsv(csv, `receipts-${exportFrom}-to-${exportTo}.csv`);
      setToast(t('reports.exportSuccess'));
    } catch {
      setToast(t('common.error'));
    }
  };

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('reports.title')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar title={t('reports.title')} />
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{t('reports.todaySales')}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {loading ? (
              <IonSpinner name="crescent" />
            ) : !isOnline ? (
              <p style={{ color: 'var(--ion-color-medium)' }}>{t('receipts.requiresInternet')}</p>
            ) : (
              <p style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{formatCents(todaySales)}</p>
            )}
          </IonCardContent>
        </IonCard>

        <h3>{t('reports.exportCsv')}</h3>
        <IonItem>
          <IonLabel position="stacked">{t('reports.exportFrom', 'From')}</IonLabel>
          <IonInput
            type="date"
            value={exportFrom}
            onIonInput={(e) => setExportFrom(e.detail.value ?? exportFrom)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">{t('reports.exportTo', 'To')}</IonLabel>
          <IonInput
            type="date"
            value={exportTo}
            onIonInput={(e) => setExportTo(e.detail.value ?? exportTo)}
          />
        </IonItem>
        <IonButton expand="block" onClick={handleExport} disabled={!isOnline} className="ion-margin-top">
          {t('reports.exportCsv')}
        </IonButton>

        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2500} />
      </IonContent>
    </IonPage>
  );
};

export default ReportsPage;
