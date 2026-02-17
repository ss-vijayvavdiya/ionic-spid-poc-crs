import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonChip,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ name: string; qty: number; priceCents: number }[]>([]);

  const subtotal = cart.reduce((s, i) => s + i.priceCents * i.qty, 0);

  return (
    <IonPage>
      <HeaderBar title={t('checkout.title')} />
      <IonContent className="ion-padding">
        <IonSearchbar
          value={search}
          onIonInput={(e) => setSearch(e.detail.value ?? '')}
          placeholder={t('common.search')}
        />
        <h3>{t('checkout.cart')}</h3>
        {cart.length === 0 ? (
          <p>{t('checkout.noProducts')}</p>
        ) : (
          <IonList>
            {cart.map((item, i) => (
              <IonItem key={i}>
                <IonLabel>
                  {item.name} x{item.qty} - {formatCents(item.priceCents * item.qty)}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
        <p><strong>{t('checkout.subtotal')}:</strong> {formatCents(subtotal)}</p>
        <p><strong>{t('checkout.total')}:</strong> {formatCents(subtotal)}</p>
        <IonButton expand="block" disabled={cart.length === 0}>
          {t('checkout.issueReceipt')}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default CheckoutPage;
