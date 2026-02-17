/**
 * Checkout: product grid, cart, payment modal, issue receipt.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { add, remove, cashOutline, cardOutline, walletOutline, gitBranchOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';
import { useMerchant } from '../contexts/MerchantContext';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { useSync } from '../contexts/SyncContext';
import { fetchProducts } from '../api/products';
import { getProducts, upsertProducts } from '../store/productsRepo';
import { createReceipt } from '../api/receipts';
import { addPendingReceipt } from '../store/receiptsRepo';
import { generateUUID } from '../utils/uuid';
import type { Product, CartItem, PaymentMethod } from '../types';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

function computeTotals(items: CartItem[]): { subtotalCents: number; taxCents: number; totalCents: number } {
  let subtotalCents = 0;
  let taxCents = 0;
  for (const item of items) {
    const lineTotal = item.unitPriceCents * item.qty;
    subtotalCents += lineTotal;
    taxCents += Math.round((lineTotal * item.vatRate) / 100);
  }
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

const PAYMENT_OPTIONS: { method: PaymentMethod; icon: typeof cashOutline }[] = [
  { method: 'CASH', icon: cashOutline },
  { method: 'CARD', icon: cardOutline },
  { method: 'WALLET', icon: walletOutline },
  { method: 'SPLIT', icon: gitBranchOutline },
];

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { merchantId } = useMerchant();
  const { isOnline } = useConnectivity();
  const { refreshPendingCount } = useSync();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [toast, setToast] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        if (isOnline) {
          const list = await fetchProducts(merchantId);
          await upsertProducts(list);
          setProducts(list.filter((p) => p.isActive !== false));
        } else {
          const list = await getProducts(merchantId);
          setProducts(list.filter((p) => p.isActive !== false));
        }
      } catch {
        setToast(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    load();
  }, [merchantId, isOnline, t]);

  const filteredProducts = products.filter(
    (p) =>
      !debouncedSearch ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.sku?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false)
  );

  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          qty: 1,
          unitPriceCents: p.priceCents,
          vatRate: p.vatRate,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const { subtotalCents, taxCents, totalCents } = computeTotals(cart);

  const handleIssueReceipt = async () => {
    if (!merchantId || cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const confirmPaymentAndIssue = async () => {
    if (!merchantId || cart.length === 0) return;
    setShowPaymentModal(false);
    setIssuing(true);
    const clientReceiptId = generateUUID();
    const items = cart.map((item) => ({
      name: item.name,
      qty: item.qty,
      unitPriceCents: item.unitPriceCents,
      vatRate: item.vatRate,
      lineTotalCents: item.unitPriceCents * item.qty,
    }));
    const issuedAt = new Date().toISOString();
    try {
      if (isOnline) {
        const { id, number } = await createReceipt(merchantId, {
          clientReceiptId,
          issuedAt,
          status: 'COMPLETED',
          paymentMethod,
          currency: 'EUR',
          subtotalCents,
          taxCents,
          totalCents,
          items,
          createdOffline: false,
        });
        setToast(`${t('checkout.receiptIssued')} ${number}`);
        setCart([]);
        setTimeout(() => history.push(`/receipts/${id}`), 1000);
      } else {
        await addPendingReceipt({
          clientReceiptId,
          merchantId,
          issuedAt,
          status: 'COMPLETED',
          paymentMethod,
          currency: 'EUR',
          subtotalCents,
          taxCents,
          totalCents,
          items,
          createdOffline: true,
        });
        await refreshPendingCount();
        setToast(t('checkout.savedOffline'));
        setCart([]);
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIssuing(false);
    }
  };

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('checkout.title')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar title={t('checkout.title')} />
      <IonContent className="ion-padding">
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
        ) : (
          <IonGrid>
            <IonRow>
              {filteredProducts.map((p) => (
                <IonCol size="6" sizeMd="4" key={p.id}>
                  <IonCard button onClick={() => addToCart(p)}>
                    <IonCardContent className="ion-text-center">
                      <p style={{ fontWeight: 600, margin: 0 }}>{p.name}</p>
                      <p style={{ margin: '0.25rem 0 0', color: 'var(--ion-color-medium)' }}>
                        {formatCents(p.priceCents)}
                      </p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

        {/* Sticky cart summary at bottom */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--ion-background-color)',
            padding: '1rem',
            borderTop: '1px solid var(--ion-color-light)',
            boxShadow: '0 -2px 4px rgba(0,0,0,0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem' }}>{t('checkout.cart')}</h3>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--ion-color-medium)', margin: 0 }}>{t('checkout.noProducts')}</p>
          ) : (
            <IonList>
              {cart.map((item) => (
                <IonItem key={item.productId} lines="none">
                  <IonLabel>
                    {item.name} x{item.qty} — {formatCents(item.unitPriceCents * item.qty)}
                  </IonLabel>
                  <IonButton fill="clear" size="small" onClick={() => updateQty(item.productId, -1)}>
                    <IonIcon icon={remove} />
                  </IonButton>
                  <span style={{ margin: '0 0.25rem' }}>{item.qty}</span>
                  <IonButton fill="clear" size="small" onClick={() => updateQty(item.productId, 1)}>
                    <IonIcon icon={add} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          )}
          <p style={{ margin: '0.25rem 0' }}>
            <strong>{t('checkout.subtotal')}:</strong> {formatCents(subtotalCents)}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>{t('checkout.tax')}:</strong> {formatCents(taxCents)}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>{t('checkout.total')}:</strong> {formatCents(totalCents)}
          </p>
          <IonButton
            expand="block"
            disabled={cart.length === 0 || issuing}
            onClick={handleIssueReceipt}
          >
            {issuing ? <IonSpinner name="crescent" /> : t('checkout.issueReceipt')}
          </IonButton>
        </div>

        {/* Payment method modal */}
        <IonModal
          isOpen={showPaymentModal}
          onDidDismiss={() => setShowPaymentModal(false)}
          breakpoints={[0, 0.5]}
          initialBreakpoint={0.5}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>{t('checkout.paymentMethod')}</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowPaymentModal(false)}>
                {t('common.cancel')}
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {PAYMENT_OPTIONS.map((opt) => (
              <IonItem
                key={opt.method}
                button
                onClick={() => {
                  setPaymentMethod(opt.method);
                }}
                detail={paymentMethod === opt.method}
              >
                <IonIcon slot="start" icon={opt.icon} />
                <IonLabel>{t(`checkout.${opt.method.toLowerCase()}`)}</IonLabel>
              </IonItem>
            ))}
            <IonButton expand="block" onClick={confirmPaymentAndIssue} disabled={issuing}>
              {issuing ? <IonSpinner name="crescent" /> : t('checkout.issueReceipt')}
            </IonButton>
          </IonContent>
        </IonModal>

        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2500} />
      </IonContent>
    </IonPage>
  );
};

export default CheckoutPage;
