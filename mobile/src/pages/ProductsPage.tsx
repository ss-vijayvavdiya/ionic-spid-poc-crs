import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonToast,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import EmptyState from '../components/EmptyState';
import ProductThumbnail from '../components/ProductThumbnail';
import { formatCents } from '../utils/money';
import { useMerchant } from '../contexts/MerchantContext';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { fetchProducts } from '../api/products';
import { getProducts, upsertProducts, seedSampleProducts } from '../store/productsRepo';
import type { Product } from '../types';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { merchantId } = useMerchant();
  const { isOnline } = useConnectivity();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [seeding, setSeeding] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const loadProducts = useCallback(async () => {
    if (!merchantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isOnline) {
        const list = await fetchProducts(merchantId);
        await upsertProducts(list);
        setProducts(list);
      } else {
        const list = await getProducts(merchantId);
        setProducts(list);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setToast(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [merchantId, isOnline, t]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    loadProducts().then(() => e.detail.complete());
  };

  const handleLoadSampleData = async () => {
    if (!merchantId || seeding) return;
    setSeeding(true);
    try {
      await seedSampleProducts(merchantId);
      await loadProducts();
      setToast(t('products.sampleDataLoaded', 'Sample data loaded'));
    } catch {
      setToast(t('common.error'));
    } finally {
      setSeeding(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      !debouncedSearch ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.sku?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false)
  );

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('products.title')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
          <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2000} />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar title={t('products.title')} />
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSearchbar
          value={search}
          onIonInput={(e) => setSearch(e.detail.value ?? '')}
          placeholder={t('common.search')}
          debounce={300}
        />

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>{t('common.loading')}</p>
          </div>
        ) : error ? (
          <IonCard color="danger">
            <IonCardContent>
              <p>{error}</p>
            </IonCardContent>
          </IonCard>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={products.length === 0 ? t('products.empty') : t('products.noResults')}
            ctaLabel={products.length === 0 ? t('products.loadSampleData') : undefined}
            onCta={products.length === 0 ? handleLoadSampleData : undefined}
            ctaLoading={seeding}
            secondaryCtaLabel={products.length === 0 ? t('products.addProduct') : undefined}
            onSecondaryCta={products.length === 0 ? () => history.push('/products/new') : undefined}
          />
        ) : (
          <div className="product-list">
            {filtered.map((p, i) => (
              <IonCard
                key={p.id}
                button
                onClick={() => history.push(`/products/${p.id}/edit`)}
                style={{ animationDelay: `${i * 50}ms` }}
                className="product-card"
              >
                <IonCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ProductThumbnail category={p.category} name={p.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <IonCardTitle>{p.name}</IonCardTitle>
                      {p.category && (
                        <p style={{ fontSize: '0.85em', color: 'var(--ion-color-medium)', margin: 0 }}>
                          {p.category}
                        </p>
                      )}
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ margin: 0, fontWeight: 600 }}>{formatCents(p.priceCents)}</p>
                  <p style={{ fontSize: '0.85em', color: 'var(--ion-color-medium)', margin: '0.25rem 0 0' }}>
                    VAT {p.vatRate}% {p.sku && `• ${p.sku}`}
                  </p>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/products/new')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default ProductsPage;
