/**
 * Customers list with add/edit/delete.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonToast,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { add, createOutline, trashOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import EmptyState from '../components/EmptyState';
import { useMerchant } from '../contexts/MerchantContext';
import { fetchCustomers, deleteCustomer } from '../api/customers';
import type { Customer } from '../types';

const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { merchantId } = useMerchant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!merchantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await fetchCustomers(merchantId);
      setCustomers(list);
    } catch {
      setToast(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [merchantId, t]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    loadCustomers().then(() => e.detail.complete());
  };

  const handleDelete = async (c: Customer) => {
    if (!merchantId || !window.confirm(t('customers.confirmDelete', { name: c.name }))) return;
    setDeletingId(c.id);
    try {
      await deleteCustomer(c.id, merchantId);
      setCustomers((prev) => prev.filter((x) => x.id !== c.id));
      setToast(t('common.saved'));
    } catch {
      setToast(t('common.error'));
    } finally {
      setDeletingId(null);
    }
  };

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('menu.customers')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar
        title={t('menu.customers')}
        actions={
          <IonButton fill="clear" onClick={() => history.push('/customers/new')}>
            <IonIcon slot="icon-only" icon={add} />
          </IonButton>
        }
      />
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>{t('common.loading')}</p>
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            message={t('customers.empty')}
            ctaLabel={t('customers.addCustomer')}
            onCta={() => history.push('/customers/new')}
          />
        ) : (
          <IonList>
            {customers.map((c) => (
              <IonCard key={c.id} className="receipt-card">
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>{c.name}</p>
                      {c.email && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9em', color: 'var(--ion-color-medium)' }}>{c.email}</p>
                      )}
                      {c.phone && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9em', color: 'var(--ion-color-medium)' }}>{c.phone}</p>
                      )}
                    </div>
                    <div>
                      <IonButton fill="clear" size="small" onClick={() => history.push(`/customers/${c.id}/edit`)}>
                        <IonIcon icon={createOutline} />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        size="small"
                        color="danger"
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                      >
                        {deletingId === c.id ? <IonSpinner name="crescent" /> : <IonIcon icon={trashOutline} />}
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}

        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default CustomersPage;
