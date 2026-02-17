import React from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonBadge } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { formatCents } from '../utils/money';

const ReceiptsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const receipts: { id: string; number?: string; issuedAt: string; totalCents: number; status: string; syncStatus?: string }[] = [];

  return (
    <IonPage>
      <HeaderBar title={t('receipts.title')} />
      <IonContent className="ion-padding">
        <h3>{t('receipts.history')}</h3>
        {receipts.length === 0 ? (
          <p>{t('common.loading')}</p>
        ) : (
          <IonList>
            {receipts.map((r) => (
              <IonItem key={r.id} button onClick={() => history.push(`/receipts/${r.id}`)}>
                <IonLabel>
                  <h2>{r.number ?? r.id}</h2>
                  <p>{r.issuedAt} - {formatCents(r.totalCents)}</p>
                </IonLabel>
                <IonBadge slot="end">{r.status}</IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ReceiptsPage;
