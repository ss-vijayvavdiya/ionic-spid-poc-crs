import React from 'react';
import { IonContent, IonPage, IonCard, IonCardContent, IonLabel } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/HeaderBar';
import { useMerchant } from '../contexts/MerchantContext';
import { useHistory } from 'react-router-dom';

const MerchantSelectPage: React.FC = () => {
  const { t } = useTranslation();
  const { merchants, selectMerchant } = useMerchant();
  const history = useHistory();

  const handleSelect = (m: { id: string; name: string }) => {
    selectMerchant(m);
    history.replace('/checkout');
  };

  return (
    <IonPage>
      <HeaderBar title={t('merchant.select')} />
      <IonContent className="ion-padding">
        <p style={{ color: 'var(--ion-color-medium)', marginBottom: '1rem' }}>
          {t('merchant.select')} to start
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {merchants.map((m, i) => (
            <IonCard
              key={m.id}
              button
              onClick={() => handleSelect(m)}
              style={{
                borderLeft: '4px solid var(--ion-color-primary)',
                animationDelay: `${i * 60}ms`,
              }}
              className="product-card"
            >
              <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                  }}
                >
                  {m.name.charAt(0)}
                </div>
                <IonLabel>
                  <h2 style={{ fontWeight: 600, margin: 0 }}>{m.name}</h2>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>
                    Tap to select
                  </p>
                </IonLabel>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
        {merchants.length === 0 && (
          <p style={{ color: 'var(--ion-color-medium)', textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MerchantSelectPage;
