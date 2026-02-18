/**
 * Receipts list: grouped by date, filters, pull-to-refresh.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonChip,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import { formatCents } from '../utils/money';
import { useMerchant } from '../contexts/MerchantContext';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { useSync } from '../contexts/SyncContext';
import { fetchReceipts } from '../api/receipts';
import { getLocalReceiptsForDisplay, pendingRecordToReceipt } from '../store/receiptsRepo';
import type { Receipt } from '../types';

type DateGroup = 'today' | 'yesterday' | 'thisWeek' | 'older';

function getDateGroup(issuedAt: string): DateGroup {
  const d = new Date(issuedAt);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  if (d >= todayStart) return 'today';
  if (d >= yesterdayStart) return 'yesterday';
  if (d >= weekStart) return 'thisWeek';
  return 'older';
}

function formatTime(issuedAt: string): string {
  const d = new Date(issuedAt);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'VOIDED': return 'danger';
    case 'REFUNDED': return 'warning';
    case 'PENDING_SYNC': return 'warning';
    default: return 'medium';
  }
}

const ReceiptsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { merchantId } = useMerchant();
  const { isOnline } = useConnectivity();
  const { refreshPendingCount } = useSync();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPayment, setFilterPayment] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const loadReceipts = useCallback(async () => {
    if (!merchantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let apiList: Receipt[] = [];
      if (isOnline) {
        apiList = await fetchReceipts(merchantId, {
          status: filterStatus ?? undefined,
          payment: filterPayment ?? undefined,
        });
      }
      const localRecords = await getLocalReceiptsForDisplay(merchantId);
      const localReceipts = localRecords.map(pendingRecordToReceipt);
      const apiIds = new Set(apiList.map((r) => r.clientReceiptId ?? r.id));
      const localOnly = localReceipts.filter((r) => !apiIds.has(r.clientReceiptId));
      let merged: Receipt[] = [...apiList.map((r) => ({ ...r, syncStatus: undefined as const })), ...localOnly];
      merged.sort((a, b) => (b.issuedAt > a.issuedAt ? 1 : -1));
      if (filterStatus) merged = merged.filter((r) => r.status === filterStatus);
      if (filterPayment) merged = merged.filter((r) => r.paymentMethod === filterPayment);
      setReceipts(merged);
      await refreshPendingCount();
    } catch {
      setToast(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [merchantId, filterStatus, filterPayment, isOnline, t, refreshPendingCount]);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  const handleRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    loadReceipts().then(() => e.detail.complete());
  };

  const grouped = receipts.reduce<Record<DateGroup, Receipt[]>>(
    (acc, r) => {
      const g = getDateGroup(r.issuedAt);
      if (!acc[g]) acc[g] = [];
      acc[g].push(r);
      return acc;
    },
    { today: [], yesterday: [], thisWeek: [], older: [] }
  );

  const groupLabels: { key: DateGroup; label: string }[] = [
    { key: 'today', label: t('receipts.today') },
    { key: 'yesterday', label: t('receipts.yesterday') },
    { key: 'thisWeek', label: t('receipts.thisWeek') },
    { key: 'older', label: t('receipts.older') },
  ];

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('receipts.title')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar title={t('receipts.title')} />
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <IonChip
            color={!filterStatus ? 'primary' : 'medium'}
            onClick={() => setFilterStatus(null)}
          >
            {t('receipts.filters')}: All
          </IonChip>
          {(['COMPLETED', 'VOIDED', 'REFUNDED'] as const).map((s) => (
            <IonChip
              key={s}
              color={filterStatus === s ? 'primary' : 'medium'}
              onClick={() => setFilterStatus(filterStatus === s ? null : s)}
            >
              {t(`receipts.status.${s.toLowerCase()}`)}
            </IonChip>
          ))}
          {(['CASH', 'CARD'] as const).map((p) => (
            <IonChip
              key={p}
              color={filterPayment === p ? 'primary' : 'medium'}
              onClick={() => setFilterPayment(filterPayment === p ? null : p)}
            >
              {p}
            </IonChip>
          ))}
        </div>

        {loading ? (
          <div className="product-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} variant="receipt" />
            ))}
          </div>
        ) : receipts.length === 0 ? (
          <EmptyState
            message={t('receipts.empty')}
            ctaLabel={t('menu.checkout')}
            onCta={() => history.push('/checkout')}
          />
        ) : (
          groupLabels.map(({ key, label }) => {
            const items = grouped[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--ion-color-medium)' }}>{label}</h3>
                {items.map((r, i) => (
                  <IonCard
                    key={r.id}
                    button
                    onClick={() => history.push(`/receipts/${r.id}`)}
                    style={{
                      animationDelay: `${i * 40}ms`,
                      borderLeft: `4px solid ${r.status === 'COMPLETED' ? '#10b981' : r.status === 'VOIDED' ? '#ef4444' : '#f59e0b'}`,
                    }}
                    className="receipt-card"
                  >
                    <IonCardContent>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 600, margin: 0 }}>{r.number ?? r.id}</p>
                          <p style={{ margin: '0.25rem 0 0', color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>
                            {formatTime(r.issuedAt)} · {formatCents(r.totalCents)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          {r.syncStatus === 'PENDING' && (
                            <IonBadge color="warning">{t('receipts.status.pendingSync')}</IonBadge>
                          )}
                          {r.syncStatus === 'FAILED' && (
                            <IonBadge color="danger">{t('receipts.syncFailed', 'Sync failed')}</IonBadge>
                          )}
                          <IonBadge color={getStatusColor(r.status)}>
                            {t(`receipts.status.${(r.status || 'COMPLETED').toLowerCase()}`)}
                          </IonBadge>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            );
          })
        )}

        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default ReceiptsPage;
