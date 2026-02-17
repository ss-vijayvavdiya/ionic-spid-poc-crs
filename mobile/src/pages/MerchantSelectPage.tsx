import React from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
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
        <IonList>
          {merchants.map((m) => (
            <IonItem key={m.id} button onClick={() => handleSelect(m)}>
              <IonLabel>{m.name}</IonLabel>
            </IonItem>
          ))}
        </IonList>
        {merchants.length === 0 && (
          <p>{t('common.loading')}</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MerchantSelectPage;
