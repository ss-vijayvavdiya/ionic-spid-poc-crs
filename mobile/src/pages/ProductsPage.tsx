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
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonAlert,
} from '@ionic/react';
import { add, createOutline, eyeOffOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import EmptyState from '../components/EmptyState';
import ProductThumbnail from '../components/ProductThumbnail';
import SkeletonCard from '../components/SkeletonCard';
import { formatCents } from '../utils/money';
import { useMerchant } from '../contexts/MerchantContext';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { fetchProducts, updateProduct } from '../api/products';
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
  const [deactivateProduct, setDeactivateProduct] = useState<Product | null>(null);
  const slidingRefs = React.useRef<{ [key: string]: HTMLIonItemSlidingElement | null }>({});

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

  const handleDeactivate = async (p: Product) => {
    if (!merchantId) return;
    setDeactivateProduct(null);
    slidingRefs.current[p.id]?.close();
    try {
      await updateProduct(p.id, merchantId, { isActive: false });
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      setToast(t('common.saved'));
    } catch {
      setToast(t('common.error'));
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
          <div className="product-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} variant="product" />
            ))}
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
          <IonList className="product-list">
            {filtered.map((p, i) => (
              <IonItemSliding
                key={p.id}
                ref={(el) => { slidingRefs.current[p.id] = el; }}
                style={{ animationDelay: `${i * 50}ms` }}
                className="product-card"
              >
                <IonItem
                  button
                  onClick={() => history.push(`/products/${p.id}/edit`)}
                  detail={false}
                  lines="full"
                  className="ion-padding-vertical"
                >
                  <div slot="start" style={{ marginRight: 12 }}>
                    <ProductThumbnail category={p.category} name={p.name} size="md" />
                  </div>
                  <IonLabel className="ion-padding-start">
                    <h2 style={{ fontWeight: 600 }}>{p.name}</h2>
                    {p.category && (
                      <p style={{ fontSize: '0.85em', color: 'var(--ion-color-medium)', margin: 0 }}>
                        {p.category}
                      </p>
                    )}
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{formatCents(p.priceCents)}</p>
                    <p style={{ fontSize: '0.85em', color: 'var(--ion-color-medium)', margin: 0 }}>
                      VAT {p.vatRate}% {p.sku && `• ${p.sku}`}
                    </p>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="primary" onClick={() => { slidingRefs.current[p.id]?.close(); history.push(`/products/${p.id}/edit`); }}>
                    <IonIcon icon={createOutline} slot="icon-only" />
                    {t('common.edit')}
                  </IonItemOption>
                  <IonItemOption color="warning" onClick={() => { if (!isOnline) { setToast(t('receipts.requiresInternet')); slidingRefs.current[p.id]?.close(); return; } setDeactivateProduct(p); }}>
                    <IonIcon icon={eyeOffOutline} slot="icon-only" />
                    {t('products.deactivate')}
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}

        <IonAlert
          isOpen={!!deactivateProduct}
          onDidDismiss={() => {
            if (deactivateProduct) slidingRefs.current[deactivateProduct.id]?.close();
            setDeactivateProduct(null);
          }}
          header={t('products.deactivate')}
          message={t('products.confirmDeactivate', { name: deactivateProduct?.name ?? '' })}
          buttons={[
            { text: t('common.cancel'), role: 'cancel' },
            { text: t('products.deactivate'), role: 'destructive', handler: () => deactivateProduct && handleDeactivate(deactivateProduct) },
          ]}
        />

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
